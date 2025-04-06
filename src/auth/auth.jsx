import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import Cookies from 'js-cookie';
import { createSessionInDb, validateSessionTokenInDb } from '../api/auth';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return encodeBase64url(bytes);
}

export async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  await createSessionInDb(sessionId, userId);

  return { id: sessionId, userId, expires_at: new Date(Date.now() + DAY_IN_MS * 30) };
}

export async function validateSessionToken(token) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const { session, user } = await validateSessionTokenInDb(sessionId);

  return { session, user };
}

export function setSessionTokenCookie(token, expiresAt) {
  Cookies.set(sessionCookieName, token, { expires: expiresAt, path: '/' });
}

export function deleteSessionTokenCookie() {
  Cookies.remove(sessionCookieName, { path: '/' });
}
