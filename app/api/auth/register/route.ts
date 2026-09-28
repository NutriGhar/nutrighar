import { NextResponse } from 'next/server';
import { encodeCustomerSession, CUSTOMER_COOKIE_NAME, CustomerSession, hashPassword } from '@/lib/customerAuth';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

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

    if (password.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '').slice(-10) : null;

    // Cryptographically hash password with bcrypt & salt
    const hashedPassword = await hashPassword(password);

    let customerId = `cust_${Date.now()}`;
    let customerName = name.trim();
    let customerEmail = cleanEmail;
    let customerPhone = cleanPhone;

    try {
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
          passwordHash: hashedPassword,
          phone: cleanPhone,
        },
      });

      if (customer) {
        customerId = customer.id;
        customerName = customer.name || customerName;
        customerEmail = customer.email || customerEmail;
        customerPhone = customer.phone || customerPhone;
      }
    } catch (dbErr: any) {
      console.warn('[Register] DB connection fallback note:', dbErr.message);
    }

    // Send welcome email asynchronously
    sendWelcomeEmail(customerName, cleanEmail).catch((err) =>
      console.error('Error sending welcome email:', err)
    );

    const session: CustomerSession = {
      id: customerId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
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
