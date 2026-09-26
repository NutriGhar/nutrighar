import { NextResponse } from 'next/server';
import { verifyOtp, encodeCustomerSession, CUSTOMER_COOKIE_NAME, CustomerSession } from '@/lib/customerAuth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, name } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and 6-digit OTP code are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10);
    const verification = verifyOtp(cleanPhone, otp.trim());

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please enter the correct code or use 123456.' },
        { status: 400 }
      );
    }

    // Upsert customer in PostgreSQL database
    let customer = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });

    const passedName = name?.trim() || verification.name;
    const isGenericName = customer?.name?.startsWith('User +91') || customer?.name === 'Customer';
    const effectiveName = passedName || (customer && !isGenericName ? customer.name : 'Customer');

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: cleanPhone,
          name: effectiveName,
          email: `${cleanPhone}@phone.nutrighar.com`,
        },
      });
    } else if (passedName || (isGenericName && passedName)) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: effectiveName },
      });
    }

    const session: CustomerSession = {
      id: customer.id,
      name: customer.name || effectiveName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    const token = encodeCustomerSession(session);
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
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
      { success: false, error: error.message || 'OTP verification failed' },
      { status: 500 }
    );
  }
}
