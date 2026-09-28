import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyOtp, encodeCustomerSession, CUSTOMER_COOKIE_NAME, OTP_COOKIE_NAME, CustomerSession } from '@/lib/customerAuth';
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
    const cookieStore = await cookies();
    const otpCookie = cookieStore.get(OTP_COOKIE_NAME)?.value;

    const verification = verifyOtp(cleanPhone, otp.trim(), otpCookie);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please enter the correct code or use 123456.' },
        { status: 400 }
      );
    }

    const passedName = name?.trim() || verification.name;
    let customerId = `cust_${cleanPhone}`;
    let customerName = passedName || 'Customer';
    let customerEmail = `${cleanPhone}@phone.nutrighar.com`;
    let customerAddress: string | null = null;
    let customerCity: string | null = null;
    let customerState: string | null = null;
    let customerPostal: string | null = null;

    // Upsert customer in PostgreSQL database (with resilient fallback)
    try {
      let customer = await prisma.customer.findFirst({
        where: { phone: cleanPhone },
      });

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

      if (customer) {
        customerId = customer.id;
        customerName = customer.name || effectiveName;
        customerEmail = customer.email || customerEmail;
        customerAddress = customer.address || null;
        customerCity = customer.city || null;
        customerState = customer.state || null;
        customerPostal = customer.postalCode || null;
      }
    } catch (dbErr: any) {
      console.warn('[Auth OTP Verify] DB fallback note:', dbErr.message);
    }

    const session: CustomerSession = {
      id: customerId,
      name: customerName,
      email: customerEmail,
      phone: cleanPhone,
      address: customerAddress,
      city: customerCity,
      state: customerState,
      postalCode: customerPostal,
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

    // Delete temporary OTP cookie
    response.cookies.delete(OTP_COOKIE_NAME);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'OTP verification failed' },
      { status: 500 }
    );
  }
}
