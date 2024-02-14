import asyncHandler from "express-async-handler";
import Slot from "../models/slotModel.js";

//get all slots
const getSlots = asyncHandler(async (req, res) => {
  const { count, rows: slots } = await Slot.findAndCountAll();
  res.status(200).json({
    totalSlots: count,
    slots,
  });
});

//get slot by id
const getSlotById = asyncHandler(async (req, res) => {
  const slot = await Slot.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (slot) {
    return res.json(slot);
  } else {
    res.status(400).json({
      message: "Resource not found",
    });
  }
});

//crete Slot
const createSlot = asyncHandler(async (req, res) => {
  //get body data
  const { slotName } = req.body;

  //save the slot details in db
  const slot = await Slot.create({
    slotName,
  });
  if (slot) {
    //send back user data
    res.status(201).json({
      slot,
    });
  } else {
    res.status(400).json({ message: "invalid slot data" });
  }
});

//update Slot
const updateSlot = asyncHandler(async (req, res) => {
  //get body data
  const { slotName } = req.body;

  //check if slot exists
  const slot = await Slot.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (slot) {
    slot.slotName = req.body.slotName;

    const updatedSlot = await slot.save();
    res.status(200).json(updatedSlot);
  } else {
    res.status(404).json({ msg: "Resource not found" });
  }
});

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (slot) {
    await Slot.destroy({ where: { id: slot.id } });
    res.json({ message: "Slot removed" });
  } else {
    res.status(404).json({ msg: "Slot not found" });
  }
});

export { getSlots, getSlotById, createSlot, updateSlot, deleteSlot };
