import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name } = body;

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10);
    const otpCode = generateOtp(cleanPhone, name?.trim());

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      // We provide the demo OTP in development for effortless testing:
      demoOtp: otpCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
