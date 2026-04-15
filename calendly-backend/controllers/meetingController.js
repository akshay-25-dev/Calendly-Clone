const { Booking, EventType } = require("../models");
const { Op } = require("sequelize");

// Get meetings (upcoming + past + cancelled)
exports.getMeetings = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const meetings = await Booking.findAll({
      include: [EventType],
      order: [["date", "ASC"], ["time", "ASC"]],
    });

    const upcoming = meetings.filter(
      (m) => m.date >= today && m.status === "booked"
    );
    const past = meetings.filter((m) => m.date < today);
    const cancelled = meetings.filter((m) => m.status === "cancelled");

    res.json({ upcoming, past, cancelled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Booking.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.status = "cancelled";
    await meeting.save();

    res.json({ message: "Meeting cancelled", meeting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single meeting
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Booking.findByPk(req.params.id, {
      include: [EventType],
    });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};