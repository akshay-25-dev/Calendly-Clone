const express = require("express");
const router = express.Router();
const controller = require("../controllers/availabilityController");

router.post("/", controller.setAvailability);
router.get("/", controller.getAvailability);
router.post("/override", controller.createOverride);
router.get("/overrides", controller.getOverrides);
router.delete("/override/:id", controller.deleteOverride);

module.exports = router;