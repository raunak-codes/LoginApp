const assetService = require("../services/assetService");
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
};

module.exports = assetController;
