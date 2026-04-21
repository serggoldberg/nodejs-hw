import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

// Реєстрація користувача
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// Логін користувача
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// Логут користувача
router.post('/auth/logout', logoutUser);

router.post('/auth/refresh', refreshUserSession);

// Відправка листа з посиланням для скидання пароля
router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  resetPassword,
);
export default router;
