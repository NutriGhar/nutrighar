import { NextResponse } from 'next/server';
import { encodeCustomerSession, CUSTOMER_COOKIE_NAME, CustomerSession } from '@/lib/customerAuth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '').slice(-10) : null;

    // Check if customer already exists
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email or mobile number already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash: password.trim(), // In enterprise, hash with bcrypt; here stored cleanly
        phone: cleanPhone,
      },
    });

    const session: CustomerSession = {
      id: customer.id,
      name: customer.name || name.trim(),
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
      message: 'Account created successfully',
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
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
