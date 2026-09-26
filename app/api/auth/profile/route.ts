import { NextResponse } from 'next/server';
import { getCustomerSession, encodeCustomerSession, CUSTOMER_COOKIE_NAME, CustomerSession } from '@/lib/customerAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.id },
    });

    if (!customer) {
      return NextResponse.json({ authenticated: false }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, city, state, postalCode } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone.trim().replace(/[^0-9]/g, '').slice(-10);
    if (address !== undefined) updateData.address = address.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (postalCode !== undefined) updateData.postalCode = postalCode.trim();

    let updatedCustomer;
    try {
      updatedCustomer = await prisma.customer.update({
        where: { id: session.id },
        data: updateData,
      });
    } catch {
      // If customer not found in DB by ID, search by phone
      if (session.phone) {
        updatedCustomer = await prisma.customer.upsert({
          where: { phone: session.phone },
          update: updateData,
          create: {
            phone: session.phone,
            name: updateData.name || session.name || 'Valued Customer',
            email: updateData.email || session.email || `${session.phone}@phone.nutrighar.com`,
            ...updateData,
          },
        });
      } else {
        throw new Error('Customer account not found');
      }
    }

    const updatedSession: CustomerSession = {
      id: updatedCustomer.id,
      name: updatedCustomer.name || updateData.name || 'Customer',
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      city: updatedCustomer.city,
      state: updatedCustomer.state,
      postalCode: updatedCustomer.postalCode,
      expiresAt: session.expiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const token = encodeCustomerSession(updatedSession);
    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedSession,
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
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
