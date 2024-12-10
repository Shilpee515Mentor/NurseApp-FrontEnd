import mongoose, { Schema } from 'mongoose';
import { DailyStatus, IUser, UserRole,UserStatus } from '../types';
import bcrypt from 'bcryptjs';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  department: {
    type: String,
    required: function() {
      return this.role === UserRole.NURSE;
    }
  },
  room: {
    type: String,
    required: function() {
      return this.role === UserRole.PATIENT;
    }
  },
  phone: {
    type: String,
    trim: true,
    required: false
  },
  dailyStatus: {
    type: String,
    enum: Object.values(DailyStatus),
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: function() {
      return this.role === UserRole.NURSE ? UserStatus.PENDING : UserStatus.APPROVED;
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model<IUser>('User', userSchema);