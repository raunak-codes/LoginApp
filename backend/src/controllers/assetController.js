const assetService = require("../services/assetService");
const pool = require("../config/db");
const logger = require("../utils/logger");
const {
  createAssetSchema,
  updateAssetSchema,
  allocateAssetSchema,
  returnAssetSchema,
} = require("../validators/assetValidator");

const assetController = {
  listAssets: async (req, res, next) => {
    try {
      const result = await assetService.listAssets(req.query);
      res.json(result);
    } catch (err) { next(err); }
  },

  getAsset: async (req, res, next) => {
    try {
      const asset = await assetService.getAsset(req.params.id);
      res.json(asset);
    } catch (err) { next(err); }
  },

  createAsset: async (req, res, next) => {
    try {
      const { error, value } = createAssetSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);
      const asset = await assetService.createAsset(value, req.user.id);
      res.status(201).json(asset);
    } catch (err) { next(err); }
  },

  updateAsset: async (req, res, next) => {
    try {
      const { error, value } = updateAssetSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);
      const asset = await assetService.updateAsset(req.params.id, value, req.user.id);
      res.json(asset);
    } catch (err) { next(err); }
  },

  deleteAsset: async (req, res, next) => {
    try {
      await assetService.deleteAsset(req.params.id, req.user.id);
      res.json({ message: "Asset deleted successfully" });
    } catch (err) { next(err); }
  },

  allocateAsset: async (req, res, next) => {
    try {
      const { error, value } = allocateAssetSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);
      const allocation = await assetService.allocateAsset(
        req.params.id,
        value.employee_id,
        req.user.id,
        value.remarks
      );
      res.status(201).json({ message: "Asset allocated successfully", allocation });
    } catch (err) { next(err); }
  },

  returnAsset: async (req, res, next) => {
    try {
      const { error, value } = returnAssetSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);
      await assetService.returnAsset(req.params.id, req.user.id, value.remarks);
      res.json({ message: "Asset returned successfully" });
    } catch (err) { next(err); }
  },

  getHistory: async (req, res, next) => {
    try {
      const history = await assetService.getHistory(req.params.id);
      res.json(history);
    } catch (err) { next(err); }
  },

  getTypes: async (req, res, next) => {
    try {
      const types = await assetService.getTypes();
      res.json(types);
    } catch (err) { next(err); }
  },

  // ── Asset Requests Handlers (NEW) ──

  submitRequest: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const { asset_name, asset_type, reason } = req.body;

      if (!asset_name || !asset_type) {
        return res.status(400).json({ message: "Asset Name and Type are required." });
      }

      const result = await pool.query(
        `INSERT INTO asset_requests (employee_id, asset_name, asset_type, reason, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [employeeId, asset_name, asset_type, reason]
      );

      logger.info(`Asset request submitted by user ${employeeId} for ${asset_name}`);
      res.status(201).json({ message: "Asset request submitted successfully.", data: result.rows[0] });
    } catch (err) { next(err); }
  },

  getMyRequests: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const result = await pool.query(
        `SELECT * FROM asset_requests 
         WHERE employee_id = $1 
         ORDER BY created_at DESC`,
        [employeeId]
      );
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  listPendingRequests: async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT ar.*, u.name, u.email, ep.designation
         FROM asset_requests ar
         JOIN users u ON ar.employee_id = u.id
         LEFT JOIN employee_profiles ep ON u.id = ep.user_id
         WHERE ar.status = 'pending'
         ORDER BY ar.created_at ASC`
      );
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  approveRequest: async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id);
      const { asset_id } = req.body;

      if (!asset_id) {
        return res.status(400).json({ message: "Asset Selection is required for approval." });
      }

      // Check request
      const reqCheck = await pool.query(
        "SELECT * FROM asset_requests WHERE id = $1",
        [requestId]
      );

      if (reqCheck.rows.length === 0) {
        return res.status(404).json({ message: "Asset request not found." });
      }

      const assetRequest = reqCheck.rows[0];

      if (assetRequest.status !== "pending") {
        return res.status(400).json({ message: `Request is already ${assetRequest.status}.` });
      }

      // Allocate asset (validates status and registers history/email/notifications)
      await assetService.allocateAsset(
        asset_id,
        assetRequest.employee_id,
        req.user.id,
        `Allocated in response to request: ${assetRequest.asset_name}`
      );

      // Update request status
      const result = await pool.query(
        `UPDATE asset_requests 
         SET status = 'approved', allocated_asset_id = $1 
         WHERE id = $2 
         RETURNING *`,
        [asset_id, requestId]
      );

      logger.info(`Asset request ${requestId} approved and allocated asset ${asset_id}`);
      res.json({ message: "Asset request approved and allocated.", data: result.rows[0] });
    } catch (err) { next(err); }
  },

  rejectRequest: async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id);

      // Check request
      const reqCheck = await pool.query(
        "SELECT * FROM asset_requests WHERE id = $1",
        [requestId]
      );

      if (reqCheck.rows.length === 0) {
        return res.status(404).json({ message: "Asset request not found." });
      }

      const assetRequest = reqCheck.rows[0];

      if (assetRequest.status !== "pending") {
        return res.status(400).json({ message: `Request is already ${assetRequest.status}.` });
      }

      // Update status
      const result = await pool.query(
        `UPDATE asset_requests 
         SET status = 'rejected' 
         WHERE id = $1 
         RETURNING *`,
        [requestId]
      );

      // Notify employee
      await pool.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, 'Asset Request Rejected', $2)`,
        [
          assetRequest.employee_id,
          `Your request for asset "${assetRequest.asset_name}" (${assetRequest.asset_type}) has been rejected.`
        ]
      );

      logger.info(`Asset request ${requestId} rejected by user ${req.user.id}`);
      res.json({ message: "Asset request rejected.", data: result.rows[0] });
    } catch (err) { next(err); }
  },
};

module.exports = assetController;
