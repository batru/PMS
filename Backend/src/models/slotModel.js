import Sequelize from "sequelize";
import sequelize from "../utils/db.js";
//import Review from './reviewModel.js';
const Slot = sequelize.define("slot", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  slotName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Define the association
// User.hasMany(Review);

export default Slot;
