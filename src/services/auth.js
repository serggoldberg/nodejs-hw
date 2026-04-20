import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import { Session } from '../models/session.js';
import crypto from 'crypto';

export const createSession = async (userId) => {
  return Session.create({
    userId,
    accessToken: crypto.randomUUID(),
    refreshToken: crypto.randomUUID(),
    accessTokenValidUntil: FIFTEEN_MINUTES,
    refreshTokenValidUntil: ONE_DAY,
  });
};

export const setSessionCookies = (res, session) => {
  res.cookie('accessToken', createSession.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', createSession.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', createSession._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });
};
