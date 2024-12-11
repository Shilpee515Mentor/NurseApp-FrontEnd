import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  nurse: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema: Schema = new Schema({
  nurse: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ShiftSchema.index({ nurse: 1, date: 1 });

export default mongoose.model<IShift>('Shift', ShiftSchema);
