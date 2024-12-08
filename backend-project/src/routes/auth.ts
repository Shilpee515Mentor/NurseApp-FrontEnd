import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

export default router;