import asyncHandler from "express-async-handler";
import Sales from "../models/SalesModel.js";
import Parking from "../models/parkingModel.js";
import moment from "moment";
import { Sequelize, Op } from "sequelize";

//get all sales
const getSales = asyncHandler(async (req, res) => {
  try {
    const { count, rows: sales } = await Sales.findAndCountAll();
    // Calculate the sum of amountPaid
    // Calculate the sum of amountPaid, handling null or undefined values
    const sumOfAmountPaid = sales.reduce((sum, currentSale) => {
      const amountPaid = currentSale.amountPaid || 0; // Treat null or undefined as 0
      return sum + amountPaid;
    }, 0);

    res.status(200).json({
      totalSales: count,
      sales,
      sumOfAmountPaid,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error,
    });
  }
});

//get all sales date range
const getSalesRange = asyncHandler(async (req, res) => {
  try {
    //get current date in yyyy/mm/dd

    //get formdata
    let { startDate, endDate } = req.body;
    // startDate = moment.utc(startDate).local().format();
    // endDate = moment.utc(endDate).local().format();
    // startDate = moment(startDate).add(3, "hours");
    // endDate = moment(endDate).add(3, "hours");

    startDate = moment(startDate).add(3, "hours");
    endDate = moment(endDate).add(3, "hours");

    startDate = startDate.utcOffset(0);
    startDate = startDate.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    endDate = endDate.utcOffset(0);
    endDate = endDate.set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 59,
    });

    const sales = await Sales.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });
    res.status(200).json({ sales });
  } catch (err) {}
});

// get all check-ins within a date range
const getCheckInRange = asyncHandler(async (req, res) => {
  try {
    // get form data
    let { startDate, endDate } = req.body;

    console.log(startDate, endDate);

    // validate if startDate and endDate are provided
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Both startDate and endDate are required." });
    }

    // parse dates using Moment.js
    startDate = moment(startDate).add(3, "hours").startOf("day").toDate();
    endDate = moment(endDate).add(3, "hours").endOf("day").toDate();

    // query check-ins within the date range using Sequelize
    const checkins = await Parking.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    res.status(200).json({ checkins });
  } catch (err) {
    console.error("Error in getCheckInRange:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//check out
const createSale = asyncHandler(async (req, res) => {
  //get the parking
  const parking = await Parking.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!parking) {
    res.status(400).json({
      message: "Resource not found",
    });
  }

  //get body data
  const { totalAmount, amountPaid, paymentMode } = req.body;

  //@ To Be done calculate total amount

  //save the  details in db
  const sale = await Sales.create({
    vehicleOwner: parking.vehicleOwner,
    vehicleNumber: parking.vehicleNumber,
    totalAmount: totalAmount,
    amountPaid,
    paymentMode,
    slotName: parking.slotName,
    parkingId: req.params.id,
    dateIn: parking.createdAt,
    userId: req.user.id,
    shift: req.user.shift,
    staffName: req.user.name,
  });
  if (sale) {
    //update parking detais
    parking.isCheckOut = true;
    parking.dateOut = sale.createdAt;
    parking.balance = Math.ceil(totalAmount - amountPaid);
    if (parking.balance === 0) {
      parking.status = "Paid";
    }

    const updatedParking = await parking.save();
    //send back user data
    res.status(201).json({
      sale,
      updatedParking,
    });
  } else {
    res.status(400).json({ message: "invalid  data" });
  }
});

export { getSales, createSale, getSalesRange, getCheckInRange };
