const assetRepository = require("../repositories/assetRepository");
const auditRepository = require("../repositories/auditRepository");
const notificationRepository = require("../repositories/notificationRepository");
const pool = require("../../config/db");

const assetService = {
  listAssets: async (query) => {
    return assetRepository.findAll(query);
  },

  getAsset: async (id) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw Object.assign(new Error("Asset not found"), { status: 404 });
    return asset;
  },

  createAsset: async (data, performedBy) => {
    const asset = await assetRepository.create(data);

    await auditRepository.log({
      table_name: "assets",
      action_type: "INSERT",
      record_id: asset.id,
      old_data: null,
      new_data: asset,
      performed_by: performedBy,
    });

    return asset;
  },

  updateAsset: async (id, data, performedBy) => {
    const oldAsset = await assetRepository.findById(id);
    if (!oldAsset) throw Object.assign(new Error("Asset not found"), { status: 404 });

    const updated = await assetRepository.update(id, data);

    await auditRepository.log({
      table_name: "assets",
      action_type: "UPDATE",
      record_id: id,
      old_data: oldAsset,
      new_data: updated,
      performed_by: performedBy,
    });

    return updated;
  },

  deleteAsset: async (id, performedBy) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw Object.assign(new Error("Asset not found"), { status: 404 });
    if (asset.status === "allocated") throw Object.assign(new Error("Cannot delete an allocated asset"), { status: 400 });

    await auditRepository.log({
      table_name: "assets",
      action_type: "DELETE",
      record_id: id,
      old_data: asset,
      new_data: null,
      performed_by: performedBy,
    });

    await assetRepository.delete(id);
  },

  allocateAsset: async (asset_id, employee_id, allocated_by, remarks) => {
    const asset = await assetRepository.findById(asset_id);
    if (!asset) throw Object.assign(new Error("Asset not found"), { status: 404 });
    if (asset.status !== "available") throw Object.assign(new Error("Asset is not available for allocation"), { status: 400 });

    // Get employee name for notification
    const empResult = await pool.query("SELECT name FROM users WHERE id = $1", [employee_id]);
    const empName = empResult.rows[0]?.name || "Unknown Employee";

    const allocation = await assetRepository.allocate(asset_id, employee_id, allocated_by, remarks);

    // Create notification for employee
    await notificationRepository.create({
      user_id: employee_id,
      title: "Asset Assigned to You",
      message: `${asset.asset_name} (${asset.asset_code}) has been assigned to you.`,
    });

    // Audit log
    await auditRepository.log({
      table_name: "asset_allocations",
      action_type: "INSERT",
      record_id: allocation.id,
      old_data: { asset_status: "available" },
      new_data: { asset_status: "allocated", employee_id, employee_name: empName },
      performed_by: allocated_by,
    });

    return allocation;
  },

  returnAsset: async (asset_id, returned_by, remarks) => {
    const asset = await assetRepository.findById(asset_id);
    if (!asset) throw Object.assign(new Error("Asset not found"), { status: 404 });
    if (asset.status !== "allocated") throw Object.assign(new Error("Asset is not currently allocated"), { status: 400 });

    await assetRepository.returnAsset(asset_id, returned_by, remarks);

    await auditRepository.log({
      table_name: "asset_allocations",
      action_type: "UPDATE",
      record_id: asset_id,
      old_data: { asset_status: "allocated" },
      new_data: { asset_status: "available", return_date: new Date() },
      performed_by: returned_by,
    });
  },

  getHistory: async (asset_id) => {
    return assetRepository.getHistory(asset_id);
  },

  getTypes: async () => {
    return assetRepository.getTypes();
  },
};

module.exports = assetService;
