const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const skillController = require("../controllers/skillController");

router.get("/", auth, skillController.listSkills);
router.post("/", auth, skillController.createSkill);

module.exports = router;
