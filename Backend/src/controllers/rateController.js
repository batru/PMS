import asyncHandler from "express-async-handler";
import Rate from "../models/rateModel.js";

//get all rates
const getRates = asyncHandler(async (req, res) => {
  const rates = await Rate.findAll();
  res.status(200).json(rates);
});

//get rates by id
const getRateById = asyncHandler(async (req, res) => {
  const rate = await Rate.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (rate) {
    return res.json(rate);
  } else {
    res.status(400).json({
      message: "Resource not found",
    });
  }
});

//crete Rate
const createRate = asyncHandler(async (req, res) => {
  //get body data
  const { rateName, ratePrice } = req.body;

  //save the rate details in db
  const rate = await Rate.create({
    rateName,
    ratePrice,
  });
  if (rate) {
    //send back user data
    res.status(201).json({
      rate,
    });
  } else {
    res.status(400).json({ message: "invalid Rate data" });
  }
});

//update Rate
const updateRate = asyncHandler(async (req, res) => {
  //get body data
  const { rateName, ratePrice } = req.body;

  //check if rate exists
  const rate = await Rate.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (rate) {
    rate.rateName = req.body.rateName;
    rate.ratePrice = req.body.ratePrice;

    const updatedRate = await rate.save();
    res.status(200).json(updatedRate);
  } else {
    res.status(404).json({ msg: "Resource not found" });
  }
});

// @desc    Delete a Rate
// @route   DELETE /api/rates/:id
// @access  Private/Admin
const deleteRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (rate) {
    await Rate.destroy({ where: { id: rate.id } });
    res.json({ message: "Rate removed" });
  } else {
    res.status(404).json({ msg: "Rate not found" });
  }
});

export { getRates, getRateById, createRate, updateRate, deleteRate };
