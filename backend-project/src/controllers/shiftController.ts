import { Request, Response } from 'express';
import Shift from '../models/Shift';

export const createShift = async (req: Request, res: Response) => {
  try {
    const { nurse, date, startTime, endTime, department, notes } = req.body;

    const shift = new Shift({
      nurse,
      date,
      startTime,
      endTime,
      department,
      notes,
      createdBy: req.user?._id
    });

    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Error creating shift', error });
  }
};

export const getNurseShifts = async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.params;
    const shifts = await Shift.find({ nurse: nurseId })
      .sort({ date: 1, startTime: 1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shifts', error });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const updateData = req.body;

    const shift = await Shift.findByIdAndUpdate(
      shiftId,
      updateData,
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shift', error });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findByIdAndDelete(shiftId);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shift', error });
  }
};

export const getDepartmentShifts = async (req: Request, res: Response) => {
  try {
    const { department, startDate, endDate } = req.query;
    
    const shifts = await Shift.find({
      department,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('nurse', 'name email');

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department shifts', error });
  }
};
