const { Booking, EventType, Availability, DateOverride } = require("../models");
const generateSlots = require("../utils/slotGenerator");
const { Op } = require("sequelize");

// Get available slots for a given event slug + date
exports.getSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }

    const event = await EventType.findOne({ where: { slug } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check for date-specific override first
    const override = await DateOverride.findOne({ where: { date } });

    let allSlots = [];

    if (override) {
      if (override.is_blocked) {
        // Date is completely blocked
        return res.json([]);
      }
      // Use override hours
      if (override.start_time && override.end_time) {
        allSlots = generateSlots(override.start_time, override.end_time, event.duration);
      }
    } else {
      // Use regular weekly availability
      const day = new Date(date).getDay();

      const availability = await Availability.findAll({
        where: { day_of_week: day, is_available: true },
      });

      availability.forEach((slot) => {
        const slots = generateSlots(slot.start_time, slot.end_time, event.duration);
        allSlots.push(...slots);
      });
    }

    // Remove already booked slots (only active bookings, not cancelled)
    const booked = await Booking.findAll({
      where: {
        date,
        status: "booked",
      },
    });

    const bookedTimes = booked.map((b) => b.time.substring(0, 5)); // normalize to HH:MM

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { event_type_id, name, email, date, time, notes } = req.body;

    // Validate event exists
    const event = await EventType.findByPk(event_type_id);
    if (!event) {
      return res.status(404).json({ message: "Event type not found" });
    }

    // Prevent double booking (only check non-cancelled bookings)
    const existing = await Booking.findOne({
      where: {
        date,
        time,
        status: "booked",
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "This slot is already booked",
      });
    }

    const booking = await Booking.create({
      EventTypeId: event_type_id,
      name,
      email,
      date,
      time,
      notes,
    });

    // Reload with event type data
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [EventType],
    });

    res.status(201).json(fullBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get event by slug (for public booking page)
exports.getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const event = await EventType.findOne({
      where: { slug },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reschedule a booking
exports.rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    const booking = await Booking.findByPk(id, { include: [EventType] });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if new slot is available
    const existing = await Booking.findOne({
      where: {
        date,
        time,
        status: "booked",
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "New slot is already booked" });
    }

    // Update to rescheduled status with new date/time
    await booking.update({
      date,
      time,
      status: "booked", // keep as booked with new time
    });

    const updated = await Booking.findByPk(id, { include: [EventType] });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};