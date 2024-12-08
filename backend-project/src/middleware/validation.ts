import { Request, Response, NextFunction } from 'express';
import { body, validationResult, query } from 'express-validator';
import { UserRole, RequestPriority, UserStatus, RequestStatus, NursingDepartment } from '../types';

export const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(Object.values(UserRole)),
  body('department').optional().trim().notEmpty(),
  body('room').optional().trim().notEmpty(),
  validateResult
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validateResult
];

export const validateRequest = [
  body('description').trim().notEmpty(),
  body('priority').isIn(Object.values(RequestPriority)),
  body('department').isIn(Object.values(NursingDepartment)),
  body('patient').isMongoId().withMessage('Invalid patient ID'),
  body('nurse').isMongoId().withMessage('Invalid nurse ID'),
  validateResult
];

export const validateUserUpdate = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('department').optional().isMongoId(),
  body('room').optional().trim().notEmpty(),
  body('active').optional().isBoolean(),
  validateResult
];

export const validateApproval = [
  body('status').isIn([UserStatus.APPROVED, UserStatus.REJECTED]),
  validateResult
];

export const validatePatientRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('room').trim().notEmpty(),
  validateResult
];

export const validateRequestStatus = [
  body('status')
    .isIn(Object.values(RequestStatus))
    .withMessage('Invalid request status'),
  validateResult
];

export const validateGetUsersByRole = [
  query('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid user status'),
  validateResult
];

function validateResult(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}