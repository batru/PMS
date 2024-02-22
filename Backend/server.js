import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";

//DATABASE
import sequelize from "./src/utils/db.js";

import userRoute from "./src/routes/userRoutes.js";
import rateRoute from "./src/routes/rateRoutes.js";
import slotRoute from "./src/routes/slotRoutes.js";
import parkingRoute from "./src/routes/parkingRoutes.js";
import salesRoute from "./src/routes/salesRoutes.js";
import entryRoute from "./src/routes/entryRoutes.js";
//TEST DB
sequelize
  .authenticate()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

//create tables through sync
sequelize
  .sync()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
//initialize the express app
const app = express();

const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("API is running..");
});

//body parser
app.use(express.json());
app.use(urlencoded({ extended: true }));

//cors
app.use(cors());

app.use("/api/users", userRoute);
app.use("/api/rates", rateRoute);
app.use("/api/slots", slotRoute);
app.use("/api/parkings", parkingRoute);
app.use("/api/sales", salesRoute);
app.use("/api/entry", entryRoute);

app.listen(port, () => console.log(`server running on port ${port}`));
