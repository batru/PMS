import Sequelize from "sequelize";
import sequelize from "../utils/db.js";
//import Review from './reviewModel.js';
const Sales = sequelize.define("sale", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  parkingId: {
    type: Sequelize.INTEGER,
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
  totalAmount: {
    type: Sequelize.INTEGER,
  },
  amountPaid: {
    type: Sequelize.INTEGER,
  },
  paymentMode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  slotName: {
    type: Sequelize.STRING,
  },
  dateIn: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  shift: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Define the association
// User.hasMany(Review);

export default Sales;
