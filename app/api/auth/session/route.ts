import { NextResponse } from 'next/server';
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

// GET: Check Active Customer Session
export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

// DELETE: Customer Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete(CUSTOMER_COOKIE_NAME);
  return response;
}
