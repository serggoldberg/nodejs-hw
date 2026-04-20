import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validations/authValidation.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../controllers/authController.js';

const router = Router();

// Реєстрація користувача
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// Логін користувача
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// Логут користувача
router.post('/auth/logout', logoutUser);

router.post('/auth/refresh', refreshUserSession);

export default router;
