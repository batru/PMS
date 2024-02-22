import asyncHandler from "express-async-handler";
import Entry from "../models/entryModel.js";
import { Sequelize, Op } from "sequelize";
import moment from "moment";

//crete an entry
const createEntry = asyncHandler(async (req, res) => {
  //get body data
  const { slotName, vehicleNumber } = req.body;

  //save the slot details in db
  const entry = await Entry.create({
    slotName,
    vehicleNumber,
  });
  if (entry) {
    //send back user data
    res.status(201).json({
      entry,
    });
  } else {
    res.status(400).json({ message: "invalid data" });
  }
});

//update Entry
const updateEntry = asyncHandler(async (req, res) => {
  //get body data

  //check if entry exists
  const entry = await Entry.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (entry) {
    entry.slotName = req.body.slotName;
    entry.vehicleNumber = req.body.vehicleNumber;

    const updatedEntry = await entry.save();
    res.status(200).json(updatedEntry);
  } else {
    res.status(404).json({ msg: "Resource not found" });
  }
});

// @desc    Delete an entry
// @route   DELETE /api/entry/:id
// @access  Private/Admin
const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (entry) {
    await Entry.destroy({ where: { id: entry.id } });
    res.json({ msg: "Entry removed" });
  } else {
    res.status(404).json({ msg: "Entry not found" });
  }
});

//get all entries
const getEntriesToday = asyncHandler(async (req, res) => {
  const { count, rows: entries } = await Entry.findAndCountAll({
    where: {
      createdAt: {
        [Op.between]: [
          moment().startOf("day").toDate(), // Start of today
          moment().endOf("day").toDate(), // End of today
        ],
      },
    },
  });
  res.status(200).json({
    totalEntries: count,
    entries,
  });
});

export { createEntry, updateEntry, deleteEntry, getEntriesToday };
