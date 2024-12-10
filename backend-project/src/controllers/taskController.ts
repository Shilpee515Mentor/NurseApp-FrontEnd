import { Request, Response } from 'express';
import Task from '../models/Task';
import { ITask } from '../types/index';

export const getNurseTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?._id })
      .sort({ createdAt: -1 })
      .populate('patient', 'firstName lastName');

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching nurse tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { description, assignedTo, patient } = req.body as ITask;

    const task = new Task({
      description,
      assignedTo,
      assignedBy: req.user?._id,
      patient,
      status: 'pending',
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, rejectionReason } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      assignedTo: req.user?._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (rejectionReason) {
      task.rejectionReason = rejectionReason;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};
