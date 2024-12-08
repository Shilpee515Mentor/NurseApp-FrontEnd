import mongoose, { Schema } from 'mongoose';
import { IRequest, NursingDepartment, RequestPriority, RequestStatus } from '../types';
import { getAllDepartments } from '@/controllers/departmentController';

const requestSchema = new Schema<IRequest>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nurse: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: Object.values(RequestPriority),
    required: true,
    default: RequestPriority.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    required: true,
    default: RequestStatus.PENDING
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: Object.values(NursingDepartment),
    required: true
  },
  room: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

requestSchema.index({ status: 1, priority: 1, createdAt: 1 });

export const Request = mongoose.model<IRequest>('Request', requestSchema);