import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole, UserStatus } from '../types';

const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, role, department, room } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
        department,
        room
      });
  
      // Only generate token for non-nurse users or approved nurses
      if (user.role !== UserRole.NURSE || user.status === UserStatus.APPROVED) {
        const token = generateToken(user._id, user.role);
        return res.status(201).json({
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status
          }
        });
      }
  
      // For pending nurse registrations
      res.status(201).json({
        message: 'Registration successful. Please wait for admin approval to login.',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  };
  

  export const login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user || !(await (user as any).comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      if (!user.active) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }
  
      // Check nurse approval status
      if (user.role === UserRole.NURSE && user.status !== UserStatus.APPROVED) {
        return res.status(401).json({
          message: 'Your account is pending approval. Please contact the administrator.'
        });
      }
  
      const token = generateToken(user._id, user.role);
  
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login error', error });
    }
  };