import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import { sendEmail } from '../utils/sendMail.js';

// Реєстрація користувача
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  //"12345678" -> 9 раз хэшируется и на 10 раз будет -> "kgdfköjhwaälejfbökawhef"
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  // Створюємо сесію для нового користувача
  const newSession = await createSession(user._id);

  // Встановлюємо куки для сесії
  setSessionCookies(res, newSession);

  res.status(201).json(user);
};

// Логін користувача
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  //Порівнюємо пароль, який надійшов у запиті, з хешованим паролем у базі даних
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  // Створюємо сесію для користувача, який увійшов
  const newSession = await createSession(user._id);

  // Встановлюємо куки для сесії
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

// Логут користувача
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

// Оновлення сесії користувача
export const refreshUserSession = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;

  //шукає у базі даних сесію за sessionId та refreshToken з cookies;
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });
  //якщо сесія не знайдена
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  //перевіряє, чи не прострочений refresh-токен
  const isTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if (isTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  //видаляє стару сесію з бази
  await Session.deleteOne({
    _id: sessionId,
    refreshToken,
  });
  //створює нову сесію (createSession) і додає нові кукі (setSessionCookies) до відповіді
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);
  //у разі вдалої обробки запиту
  res.status(200).json({
    message: 'Session refreshed',
  });
};

// Відправка листа з посиланням для скидання пароля
export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  // Перевіряємо, чи існує користувач з таким email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }
  //Користувач є — генеруємо короткоживучий JWT і відправляємо лист
  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  // 1. Формуємо шлях до шаблона
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  // 2. Читаємо шаблон
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  // 3. Готуємо шаблон до заповнення
  const template = handlebars.compile(templateSource);
  // 4. Формуємо із шаблона HTML документ з динамічними даними
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

// Скидання пароля
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  // 1. Перевіряємо/декодуємо токен
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Повертаємо помилку якщо проблема при декодуванні
    throw createHttpError(401, 'Invalid or expired token');
  }

  // 2. Шукаємо користувача
  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // 3. Якщо користувач існує
  // створюємо новий пароль і оновлюємо користувача
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // 4. Удаляємо всі можливі попередні сесії користувача
  await Session.deleteMany({ userId: user._id });

  // 5. Повертаємо успішну відповідь
  res.status(200).json({
    message: 'Password reset successfully',
  });
};
