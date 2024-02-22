import asyncHandler from "express-async-handler";
import Entry from "../models/entryModel.js";

import { Sequelize, Op, QueryTypes } from "sequelize";
import moment from "moment";
import sequelize from "../utils/db.js";

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

const getDataRange = asyncHandler(async (req, res) => {
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

    // query entries and parkings within the date range using JOIN
    const parkings = await sequelize.query(
      `
        SELECT 
          e.vehicleNumber,
          e.createdAt AS entryCreatedAt,
          e.slotName AS entrySlotName,
          p.createdAt AS parkingCreatedAt,
          p.slotName AS parkingSlotName
        FROM entries e
        LEFT JOIN parkings p ON e.vehicleNumber = p.vehicleNumber
          AND p.createdAt >= :startDate AND p.createdAt <= :endDate
        WHERE e.createdAt >= :startDate AND e.createdAt <= :endDate
          AND p.id IS NULL
        `,
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({ parkings });
  } catch (err) {
    console.error("Error in getDataRange:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { createEntry, updateEntry, deleteEntry, getEntriesToday, getDataRange };
