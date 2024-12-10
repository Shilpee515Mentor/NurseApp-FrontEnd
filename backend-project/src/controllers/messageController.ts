import { Request, Response } from 'express';
import Message from '../models/Message';
import { IMessage } from '../types/index';
import { User } from '../models/User';

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { nurseId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user?._id, receiver: nurseId },
        { sender: nurseId, receiver: req.user?._id },
      ],
    })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiver, content, messageType, imageUrl } = req.body as IMessage;

    const message = new Message({
      sender: req.user?._id,
      receiver,
      content,
      messageType,
      imageUrl,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getNurses = async (req: Request, res: Response) => {
  try {
    // Fetch all nurses excluding the current user
    const nurses = await User.find({ role: 'nurse', _id: { $ne: req.user?._id } });
    res.json(nurses);
  } catch (error) {
    console.error('Error fetching nurses:', error);
    res.status(500).json({ message: 'Error fetching nurses' });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow the receiver to mark message as read
    if (message.receiver.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    // Emit socket event for real-time update
    req.app.get('io')?.emit('messageRead', { messageId });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
};
