const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookingController");

router.get("/slots/:slug", controller.getSlots);
router.get("/event/:slug", controller.getEventBySlug);
router.post("/", controller.createBooking);
router.patch("/:id/reschedule", controller.rescheduleBooking);

module.exports = router;