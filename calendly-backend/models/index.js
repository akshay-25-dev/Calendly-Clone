const sequelize = require("../config/db");

const EventType = require("./EventType");
const Booking = require("./Booking");
const Availability = require("./Availability");
const DateOverride = require("./DateOverride");

// Relationships
EventType.hasMany(Booking, { foreignKey: "EventTypeId", onDelete: "CASCADE" });
Booking.belongsTo(EventType, { foreignKey: "EventTypeId" });

module.exports = {
  sequelize,
  EventType,
  Booking,
  Availability,
  DateOverride,
};