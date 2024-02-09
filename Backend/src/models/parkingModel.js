import Sequelize from "sequelize";
import sequelize from "../utils/db.js";
//import Review from './reviewModel.js';
const Parking = sequelize.define("parking", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
  },
  staffName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  vehicleOwner: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  vehicleNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  rateName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ratePrice: {
    type: Sequelize.INTEGER,
  },
  balance: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  slotName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "Pending",
  },

  shift: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  isCheckOut: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

// Define the association
// User.hasMany(Review);

export default Parking;
