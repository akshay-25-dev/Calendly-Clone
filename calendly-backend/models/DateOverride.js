const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DateOverride = sequelize.define("DateOverride", {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = DateOverride;
