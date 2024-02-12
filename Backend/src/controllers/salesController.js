import asyncHandler from "express-async-handler";
import Sales from "../models/SalesModel.js";
import Parking from "../models/parkingModel.js";

//get all sales
const getSales = asyncHandler(async (req, res) => {
  //pagination
  const pageSize = 2;
  const page = Number(req.query.pageNumber) || 1;

  //number of parkings to skip
  const offset = (page - 1) * pageSize;

  try {
    //get the total count of the parkings in db
    const { count, rows: sales } = await Sales.findAndCountAll({
      limit: pageSize,
      offset: offset,
    });

    res.status(200).json({
      totalItems: count,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(count / pageSize),
      sales: sales,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error,
    });
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

export { getSales, createSale };
