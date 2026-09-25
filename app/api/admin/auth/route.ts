import { NextResponse } from 'next/server';
import { authenticateAdmin, encodeSession, getAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth';

// POST: Admin Login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const session = await authenticateAdmin(email, password);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials. Default: admin@nutrighar.com / NutriGhar@2026' },
        { status: 401 }
      );
    }

    const token = encodeSession(session);
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

// GET: Check Current Admin Session
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE: Admin Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
