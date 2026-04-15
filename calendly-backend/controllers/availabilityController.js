const { Availability, DateOverride } = require("../models");

// Set availability (replace all)
exports.setAvailability = async (req, res) => {
  try {
    const data = req.body; // array of availability objects

    await Availability.destroy({ where: {} });

    const result = await Availability.bulkCreate(data);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get availability
exports.getAvailability = async (req, res) => {
  try {
    const data = await Availability.findAll({
      order: [["day_of_week", "ASC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create date-specific override
exports.createOverride = async (req, res) => {
  try {
    const { date, start_time, end_time, is_blocked } = req.body;

    // Upsert: if override for this date exists, update it
    const existing = await DateOverride.findOne({ where: { date } });
    if (existing) {
      await existing.update({ start_time, end_time, is_blocked });
      return res.json(existing);
    }

    const override = await DateOverride.create({
      date,
      start_time,
      end_time,
      is_blocked: is_blocked || false,
    });

    res.status(201).json(override);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all overrides
exports.getOverrides = async (req, res) => {
  try {
    const overrides = await DateOverride.findAll({
      order: [["date", "ASC"]],
    });
    res.json(overrides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an override
exports.deleteOverride = async (req, res) => {
  try {
    const override = await DateOverride.findByPk(req.params.id);
    if (!override) return res.status(404).json({ message: "Override not found" });

    await override.destroy();
    res.json({ message: "Override deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};