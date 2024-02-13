import asyncHandler from "express-async-handler";
import Parking from "../models/parkingModel.js";
import Rate from "../models/rateModel.js";
import User from "../models/userModel.js";

//get all parkings
const getParkings = asyncHandler(async (req, res) => {
  //pagination
  const pageSize = 1;
  const page = Number(req.query.pageNumber) || 1;

  //number of parkings to skip
  const offset = (page - 1) * pageSize;

  try {
    //get the total count of the parkings in db
    const { count, rows: parkings } = await Parking.findAndCountAll({
      limit: pageSize,
      offset: offset,
    });

    res.status(200).json({
      totalItems: count,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(count / pageSize),
      parkings: parkings,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error,
    });
  }
});

//get parkings by id
const getParkingsById = asyncHandler(async (req, res) => {
  const parking = await Parking.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (parking) {
    return res.json(parking);
  } else {
    res.status(400).json({
      message: "Resource not found",
    });
  }
});

//crete Parking
const createParking = asyncHandler(async (req, res) => {
  //get body data
  const { vehicleOwner, vehicleNumber, rateName, slotName, phone } = req.body;

  //get the rate
  const rate = await Rate.findOne({
    where: {
      rateName: rateName,
    },
  });

  let parking = await Parking.findOne({
    where: {
      vehicleNumber: vehicleNumber,
      isCheckOut: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (parking) {
    return res.status(400).json({ msg: "Vehicle has not checked out" });
  }

  //save the parking details in db
  parking = await Parking.create({
    vehicleOwner,
    vehicleNumber: vehicleNumber,
    rateName,
    ratePrice: rate.ratePrice,
    phone,
    slotName,
    userId: req.user.id,
    shift: req.user.shift,
    staffName: req.user.name,
  });
  if (parking) {
    //send back user data
    res.status(201).json({
      parking,
    });
  } else {
    res.status(400).json({ message: "invalid parking data" });
  }
});

//update Parking
const updateParking = asyncHandler(async (req, res) => {
  //check if parking exists
  const parking = await Parking.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (parking) {
    parking.vehicleOwner = req.body.vehicleOwner || parking.vehicleOwner;
    parking.vehicleNumber = req.body.vehicleNumber || parking.vehicleNumber;
    parking.ratePrice = req.body.ratePrice || parking.ratePrice;
    parking.balance = req.body.balance || parking.balance;
    parking.slotName = req.body.slotName || parking.slotName;
    parking.phone = req.body.phone || parking.phone;
    parking.rateName = req.body.rateName || parking.rateName;
    parking.status = req.body.status || parking.status;
    const updatedParking = await parking.save();
    res.status(200).json(updatedParking);
  } else {
    res.status(404).json({ msg: "Resource not found" });
  }
});

// @desc    Delete a parking
// @route   DELETE /api/parkings/:id
// @access  Private/Admin
const deleteParking = asyncHandler(async (req, res) => {
  const parking = await Parking.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (parking) {
    await Parking.destroy({ where: { id: parking.id } });
    res.json({ message: "Parking removed" });
  } else {
    res.status(404).json({ msg: "Resource not found" });
  }
});

export {
  getParkings,
  getParkingsById,
  createParking,
  updateParking,
  deleteParking,
};
