import asyncHandler from "express-async-handler";
import Sales from "../models/SalesModel.js";
import Parking from "../models/parkingModel.js";
import moment from "moment";
import { Sequelize, Op, json } from "sequelize";

//get all sales
const getSales = asyncHandler(async (req, res) => {
  try {
    const { count, rows: sales } = await Sales.findAndCountAll();

    // Filter sales by payment method
    const mpesa = sales.filter((sale) => sale.paymentMode === "M-PESA");
    const cash = sales.filter((sale) => sale.paymentMode === "CASH");

    // Calculate the total amount paid in Mpesa
    const mpesaSales = mpesa.reduce((sum, currentSale) => {
      const amountPaid = currentSale.amountPaid || 0; // Treat null or undefined as 0
      return sum + amountPaid;
    }, 0);

    // Calculate the total amount paid in cash
    const cashSales = cash.reduce((sum, currentSale) => {
      const amountPaid = currentSale.amountPaid || 0; // Treat null or undefined as 0
      return sum + amountPaid;
    }, 0);
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
      mpesaSales,
      cashSales,
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

// Function to fetch sales data
const getSalesData = async (req, res) => {
  try {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    const salesDataThisYear = await Sales.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "month_year",
        ],
        [Sequelize.fn("SUM", Sequelize.col("amountPaid")), "totalSales"],
      ],
      where: {
        createdAt: {
          [Sequelize.Op.and]: [
            { [Sequelize.Op.gte]: today.getFullYear() + "-01-01" },
            { [Sequelize.Op.lt]: today.getFullYear() + "-12-31" },
          ],
        },
      },
      group: ["month_year"],
      order: ["month_year"],
    });

    const salesDataLastYear = await Sales.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "month_year",
        ],
        [Sequelize.fn("SUM", Sequelize.col("amountPaid")), "totalSales"],
      ],
      where: {
        createdAt: {
          [Sequelize.Op.and]: [
            { [Sequelize.Op.gte]: lastYear.getFullYear() + "-01-01" },
            { [Sequelize.Op.lt]: lastYear.getFullYear() + "-12-31" },
          ],
        },
      },
      group: ["month_year"],
      order: ["month_year"],
    });

    // Combine the results for this year and last year
    const combinedSalesData = salesDataThisYear.concat(salesDataLastYear);

    res.json(combinedSalesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
};

//get checked out from the yard Today
const getCheckedOutVehiclesToday = asyncHandler(async (req, res) => {
  try {
    const todayStart = moment().startOf("day"); // Today's date at 00:00:00
    const todayEnd = moment().endOf("day"); // Today's date at 23:59:59

    const { count, rows: checkedOutVehiclesToday } =
      await Sales.findAndCountAll({
        where: {
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
        },
      });

    res.status(200).json({
      totalCheckedOutToday: count,
      checkedOutVehiclesToday,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error,
    });
  }
});

export {
  getSales,
  createSale,
  getSalesRange,
  getCheckInRange,
  getSalesData,
  getCheckedOutVehiclesToday,
};
