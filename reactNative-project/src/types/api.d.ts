export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  createdAt: string;
  status?: string;
  room?: string;
  avatar?: string;
  allergies?: string[];
  bloodType?: string;
  emergencyContact?: string;
  insurance?: string;
  dateOfBirth?: string;
} 