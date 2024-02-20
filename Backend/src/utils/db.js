import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(
  process.env.DATABASE,
  "root",
  process.env.PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    timezone: "Etc/GMT+3", // Set to East Africa Time (UTC+3)
  }
);

export default sequelize;
