import Sequelize from "sequelize";
import sequelize from "../utils/db.js";
//import Review from './reviewModel.js';
const Rate = sequelize.define("rate", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  rateName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ratePrice: {
    type: Sequelize.INTEGER,
  },
});

// Define the association
// User.hasMany(Review);

export default Rate;
