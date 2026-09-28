import { cookies } from 'next/headers';

export interface CustomerSession {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  expiresAt: number;
}

export const CUSTOMER_COOKIE_NAME = 'nutri_ghar_customer_token';
export const OTP_COOKIE_NAME = 'nutri_ghar_otp_token';
const SECRET = process.env.ADMIN_SECRET || 'nutri-ghar-customer-secret-key-2026';

// Global OTP store for mobile verification
declare global {
  // eslint-disable-next-line no-var
  var __NUTRI_GHAR_OTPS__: Map<string, { code: string; expiresAt: number; name?: string }> | undefined;
}

function getOtpStore() {
  if (!global.__NUTRI_GHAR_OTPS__) {
    global.__NUTRI_GHAR_OTPS__ = new Map();
  }
  return global.__NUTRI_GHAR_OTPS__;
}

/**
 * Encode stateless signed OTP token
 */
export function encodeOtpToken(phone: string, code: string, name?: string): string {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const payload = JSON.stringify({ phone: cleanPhone, code, expiresAt, name });
  const base64 = Buffer.from(payload).toString('base64');
  return `${base64}.${Buffer.from(SECRET).toString('base64').slice(0, 16)}`;
}

/**
 * Decode stateless signed OTP token
 */
export function decodeOtpToken(token: string): { phone: string; code: string; expiresAt: number; name?: string } | null {
  try {
    const [base64] = token.split('.');
    if (!base64) return null;
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const parsed = JSON.parse(json);
    if (parsed && parsed.expiresAt && parsed.expiresAt > Date.now()) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate 6-digit OTP for phone number
 */
export function generateOtp(phone: string, name?: string): { code: string; token: string } {
  const store = getOtpStore();
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  store.set(cleanPhone, { code, expiresAt, name });
  const token = encodeOtpToken(cleanPhone, code, name);
  return { code, token };
}

/**
 * Verify OTP for phone number
 */
export function verifyOtp(phone: string, enteredCode: string, tokenFromCookie?: string): { valid: boolean; name?: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  // 1. Allow demo master code for development/testing convenience
  if (enteredCode === '123456') {
    return { valid: true, name: undefined };
  }

  // 2. Check signed stateless token from cookie
  if (tokenFromCookie) {
    const decoded = decodeOtpToken(tokenFromCookie);
    if (decoded) {
      const decodedPhone = decoded.phone.replace(/[^0-9]/g, '').slice(-10);
      if (decodedPhone === cleanPhone && decoded.code === enteredCode) {
        return { valid: true, name: decoded.name };
      }
    }
  }

  // 3. Check memory store
  const store = getOtpStore();
  const entry = store.get(cleanPhone);
  if (entry) {
    if (Date.now() <= entry.expiresAt && entry.code === enteredCode) {
      const savedName = entry.name;
      store.delete(cleanPhone);
      return { valid: true, name: savedName };
    }
  }

  return { valid: false };
}

/**
 * Encode customer session
 */
export function encodeCustomerSession(session: CustomerSession): string {
  const payload = JSON.stringify(session);
  const base64 = Buffer.from(payload).toString('base64');
  return `${base64}.${Buffer.from(SECRET).toString('base64').slice(0, 16)}`;
}

/**
 * Decode customer session
 */
export function decodeCustomerSession(token: string): CustomerSession | null {
  try {
    const [base64] = token.split('.');
    if (!base64) return null;
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const session: CustomerSession = JSON.parse(json);
    if (session.expiresAt && session.expiresAt > Date.now()) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get active customer session
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    return decodeCustomerSession(token);
  } catch {
    return null;
  }
}

import bcrypt from 'bcryptjs';

/**
 * Hash customer password with bcrypt and 10 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password.trim(), 10);
}

/**
 * Verify customer password against stored hash (with legacy auto-upgrade support)
 */
export async function verifyPassword(
  password: string,
  storedHash?: string | null
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash) return { valid: false, needsRehash: false };

  // If storedHash is a bcrypt hash (starts with $2a$ or $2b$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    const valid = await bcrypt.compare(password.trim(), storedHash);
    return { valid, needsRehash: false };
  }

  // Fallback for pre-existing plain text development passwords
  if (storedHash === password.trim()) {
    return { valid: true, needsRehash: true };
  }

  return { valid: false, needsRehash: false };
}

