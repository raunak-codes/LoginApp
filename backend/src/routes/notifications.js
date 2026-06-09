const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const notificationRepository = require("../repositories/notificationRepository");

// GET /api/notifications — user's notifications
router.get("/", auth, async (req, res, next) => {
  try {
    const notifications = await notificationRepository.findByUser(req.user.id);
    const unread_count = await notificationRepository.getUnreadCount(req.user.id);
    res.json({ notifications, unread_count });
  } catch (err) { next(err); }
});

// PUT /api/notifications/:id/read — mark single as read
router.put("/:id/read", auth, async (req, res, next) => {
  try {
    await notificationRepository.markRead(req.params.id, req.user.id);
    res.json({ message: "Notification marked as read" });
  } catch (err) { next(err); }
});

// PUT /api/notifications/read-all — mark all as read
router.put("/read-all", auth, async (req, res, next) => {
  try {
    await notificationRepository.markAllRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
});

module.exports = router;
