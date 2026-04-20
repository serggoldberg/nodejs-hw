import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

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

  // Створюємо сесію для користувача, який увійшов
  const newSession = await createSession(user._id);

  // Встановлюємо куки для сесії
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

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
