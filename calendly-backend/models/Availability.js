const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Availability = sequelize.define("Availability", {
  day_of_week: {
    type: DataTypes.INTEGER, // 0=Sunday, 1=Monday ... 6=Saturday
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: "Asia/Kolkata",
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Availability;