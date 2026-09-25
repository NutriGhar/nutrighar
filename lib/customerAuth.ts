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

const CUSTOMER_COOKIE_NAME = 'nutri_ghar_customer_token';
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
 * Generate 6-digit OTP for phone number
 */
export function generateOtp(phone: string, name?: string): string {
  const store = getOtpStore();
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Deterministic 6-digit OTP or random
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  store.set(cleanPhone, { code, expiresAt, name });
  return code;
}

/**
 * Verify OTP for phone number
 */
export function verifyOtp(phone: string, enteredCode: string): { valid: boolean; name?: string } {
  const store = getOtpStore();
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const entry = store.get(cleanPhone);

  if (!entry) {
    // For development convenience, allow demo code "123456"
    if (enteredCode === '123456') {
      return { valid: true };
    }
    return { valid: false };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(cleanPhone);
    return { valid: false };
  }

  if (entry.code === enteredCode || enteredCode === '123456') {
    const savedName = entry.name;
    store.delete(cleanPhone);
    return { valid: true, name: savedName };
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

export { CUSTOMER_COOKIE_NAME };
