const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const userController = require("../controllers/userController");

router.get("/profile", auth, userController.getProfile);

// Admin-only user management routes
router.get("/", auth, authorize("admin"), userController.getAllUsers);
router.put("/:id/role", auth, authorize("admin"), userController.updateUserRole);

module.exports = router;
