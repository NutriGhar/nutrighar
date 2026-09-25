import { NextResponse } from 'next/server';
import { encodeCustomerSession, CUSTOMER_COOKIE_NAME, CustomerSession } from '@/lib/customerAuth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Mobile number and password are required' },
        { status: 400 }
      );
    }

    const identifier = emailOrPhone.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '').slice(-10);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: identifier },
          ...(cleanPhone.length === 10 ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'No account found with these details. Please register first or use OTP.' },
        { status: 401 }
      );
    }

    if (customer.passwordHash && customer.passwordHash !== password.trim()) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again or sign in via Mobile OTP.' },
        { status: 401 }
      );
    }

    const session: CustomerSession = {
      id: customer.id,
      name: customer.name || 'Customer',
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    const token = encodeCustomerSession(session);
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: session,
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
