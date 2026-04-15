const express = require("express");
const router = express.Router();
const controller = require("../controllers/meetingController");

router.get("/", controller.getMeetings);
router.get("/:id", controller.getMeetingById);
router.patch("/:id/cancel", controller.cancelMeeting);

module.exports = router;