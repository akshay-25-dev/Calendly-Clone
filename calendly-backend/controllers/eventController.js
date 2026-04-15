const { EventType } = require("../models");

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { name, duration, slug, color, description, location } = req.body;

    // Check slug uniqueness
    const existing = await EventType.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ message: "Slug already in use" });
    }

    const event = await EventType.create({
      name,
      duration,
      slug,
      color: color || "#0069ff",
      description,
      location,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Events
exports.getEvents = async (req, res) => {
  try {
    const events = await EventType.findAll({ order: [["createdAt", "DESC"]] });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await EventType.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Event by Slug
exports.getEventBySlug = async (req, res) => {
  try {
    const event = await EventType.findOne({ where: { slug: req.params.slug } });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await EventType.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { name, duration, slug, color, description, location, is_active } = req.body;

    // Check slug uniqueness if changing slug
    if (slug && slug !== event.slug) {
      const existing = await EventType.findOne({ where: { slug } });
      if (existing) {
        return res.status(400).json({ message: "Slug already in use" });
      }
    }

    await event.update({
      name: name || event.name,
      duration: duration || event.duration,
      slug: slug || event.slug,
      color: color || event.color,
      description: description !== undefined ? description : event.description,
      location: location !== undefined ? location : event.location,
      is_active: is_active !== undefined ? is_active : event.is_active,
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await EventType.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.destroy();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};