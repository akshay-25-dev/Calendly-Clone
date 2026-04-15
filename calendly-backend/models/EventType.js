const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventType = sequelize.define("EventType", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: "#0069ff",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Google Meet",
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = EventType;