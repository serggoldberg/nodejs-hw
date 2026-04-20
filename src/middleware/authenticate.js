import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  // 1. Перевірити наявність accessToken кукі (якщо немає то 401)
  const { accessToken } = req.cookies;
  if (!accessToken) {
    throw createHttpError(401, 'Missing access token');
  }
  // 2. Знаходим сесію з цим accessToken (якщо немає то 401)
  const session = await Session.findOne({ accessToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  // 3. Перевіряємо строк діі токена (якщо строк вийшов то 401)
  const isTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
  if (isTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }
  // 4. Шукаємо користувача (якшо користувача не існує то 401)
  const user = await User.findById(session.userId);
  if (!user) {
    throw createHttpError(401);
  }
  // 5. Додаємо на req властивість user (req.user = user) і викликаємо next
  req.user = user;

  next();
};
