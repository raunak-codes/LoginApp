const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const assetController = require("../controllers/assetController");

// GET /api/assets/types — distinct asset types (before :id routes)
router.get("/types", auth, assetController.getTypes);

// GET /api/assets — list with pagination + filters
router.get("/", auth, assetController.listAssets);

// POST /api/assets — create new asset
router.post("/", auth, assetController.createAsset);

// GET /api/assets/:id — single asset
router.get("/:id", auth, assetController.getAsset);

// PUT /api/assets/:id — update asset
router.put("/:id", auth, assetController.updateAsset);

// DELETE /api/assets/:id — delete asset
router.delete("/:id", auth, assetController.deleteAsset);

// POST /api/assets/:id/allocate — allocate to employee
router.post("/:id/allocate", auth, assetController.allocateAsset);

// POST /api/assets/:id/return — return asset
router.post("/:id/return", auth, assetController.returnAsset);

// GET /api/assets/:id/history — asset history
router.get("/:id/history", auth, assetController.getHistory);

module.exports = router;
