import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
  },
  imageUrl: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IMessage>('Message', MessageSchema);
