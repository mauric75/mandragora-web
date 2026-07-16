import crypto from 'node:crypto';

const COOKIE_NAME = 'mandragora_admin_session';
const SESSION_MAX_AGE_SECONDS = 1800;

function digest(value) {
  return crypto.createHash('sha256').update(value).digest();
}

function safeEqual(left, right) {
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sign(payload) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '')
    .update(payload)
    .digest('base64url');
}

function isSecureRequest(req) {
  return req.headers?.['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
}

function getCookieValue(req) {
  const cookies = (req.headers?.cookie || '').split(';');
  const cookie = cookies.find((entry) => entry.trim().startsWith(`${COOKIE_NAME}=`));
  return cookie ? cookie.trim().slice(COOKIE_NAME.length + 1) : '';
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function checkAdminPassword(password) {
  if (!isAdminConfigured() || typeof password !== 'string') return false;
  const pwds = [
    { pwd: process.env.ADMIN_PASSWORD, role: 'admin' },
    { pwd: process.env.ADMIN_PASSWORD_EDITOR, role: 'editor' },
    { pwd: process.env.ADMIN_PASSWORD_CONSULTA, role: 'consulta' },
  ];
  for (const entry of pwds) {
    if (entry.pwd && safeEqual(digest(password), digest(entry.pwd))) {
      return entry.role;
    }
  }
  return false;
}

export function createSessionCookie(req, role) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${issuedAt}.${crypto.randomBytes(16).toString('hex')}.${role || 'admin'}`;
  const secure = isSecureRequest(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function hasValidAdminSession(req) {
  if (!isAdminConfigured()) return false;

  const value = getCookieValue(req);
  const separator = value.lastIndexOf('.');
  if (separator < 1) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!safeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return false;

  const issuedAt = Number(payload.split('.')[0]);
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  return Number.isFinite(issuedAt) && age >= -60 && age <= SESSION_MAX_AGE_SECONDS;
}

export function getAdminSessionRole(req) {
  const value = getCookieValue(req);
  if (!value) return null;
  const separator = value.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const parts = payload.split('.');
  return parts.length >= 3 ? parts[2] : 'admin';
}

export function clearSessionCookie(req) {
  const secure = isSecureRequest(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
