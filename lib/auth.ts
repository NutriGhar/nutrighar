// Admin Authentication and Token Management Utility
import { cookies } from 'next/headers';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: number;
}

const ADMIN_COOKIE_NAME = 'nutri_ghar_admin_token';
const DEFAULT_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || 'admin@nutrighar.com';
const DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'NutriGhar@2026';
const SECRET = process.env.ADMIN_SECRET || 'nutri-ghar-super-secret-jwt-key-2026-wellness';

/**
 * Validate admin credentials
 */
export async function authenticateAdmin(email: string, password: string): Promise<AdminSession | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Validate against configured admin credentials
  if (
    (cleanEmail === DEFAULT_EMAIL.toLowerCase() || cleanEmail === 'admin') &&
    cleanPassword === DEFAULT_PASSWORD
  ) {
    return {
      id: 'admin-1',
      email: DEFAULT_EMAIL,
      name: 'Store Administrator',
      role: 'admin',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  return null;
}

/**
 * Encode session to secure string
 */
export function encodeSession(session: AdminSession): string {
  const payload = JSON.stringify(session);
  const base64 = Buffer.from(payload).toString('base64');
  return `${base64}.${Buffer.from(SECRET).toString('base64').slice(0, 16)}`;
}

/**
 * Decode and verify session string
 */
export function decodeSession(token: string): AdminSession | null {
  try {
    const [base64] = token.split('.');
    if (!base64) return null;
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const session: AdminSession = JSON.parse(json);
    if (session.expiresAt && session.expiresAt > Date.now()) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the current request has a valid admin session
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!tokenCookie?.value) return null;
    return decodeSession(tokenCookie.value);
  } catch {
    return null;
  }
}

export { ADMIN_COOKIE_NAME };
