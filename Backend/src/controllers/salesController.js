import asyncHandler from "express-async-handler";
import Sales from "../models/SalesModel.js";
import Parking from "../models/parkingModel.js";
import moment from "moment";
import { Sequelize, Op, json } from "sequelize";

const getSales = asyncHandler(async (req, res) => {
  try {
    const { count, rows: sales } = await Sales.findAndCountAll();

    // Use reduce to calculate the sum of amountPaid for different payment modes
    const paymentSums = sales.reduce((acc, sale) => {
      const amountPaid = sale.amountPaid || 0;
      acc[sale.paymentMode] = (acc[sale.paymentMode] || 0) + amountPaid;
      return acc;
    }, {});

    res.status(200).json({
      totalSales: count,
      sales,
      sumOfAmountPaid: sales.reduce(
        (sum, sale) => sum + (sale.amountPaid || 0),
        0
      ),
      mpesaSales: paymentSums["M-PESA"] || 0,
      cashSales: paymentSums["CASH"] || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message || "Error fetching sales data.",
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

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Both startDate and endDate are required." });
    }

    // parse dates using Moment.js
    startDate = moment(startDate).add(3, "hours").startOf("day").toDate();
    endDate = moment(endDate).add(3, "hours").endOf("day").toDate();

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
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%M %Y"),
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
      order: [
        Sequelize.fn("STR_TO_DATE", Sequelize.col("month_year"), "%M %Y"),
      ],
    });

    const salesDataLastYear = await Sales.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%M %Y"),
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
      order: [
        Sequelize.fn("STR_TO_DATE", Sequelize.col("month_year"), "%M %Y"),
      ],
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
    const { count, rows: checkedOutVehiclesToday } =
      await Sales.findAndCountAll({
        where: {
          // isCheckOut: false,
          createdAt: {
            [Op.between]: [
              moment().startOf("day").toDate(), // Start of today
              moment().endOf("day").toDate(), // End of today
            ],
          },
        },
      });

    // Use reduce to calculate the sum of amountPaid for different payment modes
    const paymentSums = checkedOutVehiclesToday.reduce((acc, sale) => {
      const amountPaid = sale.amountPaid || 0;
      acc[sale.paymentMode] = (acc[sale.paymentMode] || 0) + amountPaid;
      return acc;
    }, {});

    res.status(200).json({
      totalCheckedOutToday: count,
      checkedOutVehiclesToday,
      sumOfAmountPaidToday: checkedOutVehiclesToday.reduce(
        (sum, sale) => sum + (sale.amountPaid || 0),
        0
      ),
      mpesaSalesToday: paymentSums["M-PESA"] || 0,
      cashSalesToday: paymentSums["CASH"] || 0,
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
