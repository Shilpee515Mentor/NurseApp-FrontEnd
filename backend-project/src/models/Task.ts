import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  patient?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
}

const TaskSchema: Schema = new Schema({
  description: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ITask>('Task', TaskSchema);
