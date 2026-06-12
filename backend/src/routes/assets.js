const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const assetController = require("../controllers/assetController");

// GET /api/assets/types — distinct asset types
router.get("/types", auth, assetController.getTypes);

// GET /api/assets/requests/my — view own requests
router.get("/requests/my", auth, assetController.getMyRequests);

// GET /api/assets/requests/pending — view pending requests (Admin/HR only)
router.get("/requests/pending", auth, authorize("admin", "hr"), assetController.listPendingRequests);

// POST /api/assets/request — submit asset request
router.post("/request", auth, assetController.submitRequest);

// POST /api/assets/requests/:id/approve — approve asset request (Admin/HR only)
router.post("/requests/:id/approve", auth, authorize("admin", "hr"), assetController.approveRequest);

// POST /api/assets/requests/:id/reject — reject asset request (Admin/HR only)
router.post("/requests/:id/reject", auth, authorize("admin", "hr"), assetController.rejectRequest);

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
