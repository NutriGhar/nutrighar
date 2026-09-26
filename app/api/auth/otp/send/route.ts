import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, channel = 'sms' } = body;

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10);
    const otpCode = generateOtp(cleanPhone, name?.trim());

    const isWhatsApp = channel === 'whatsapp';
    const message = isWhatsApp
      ? `✓ 6-Digit OTP sent to your WhatsApp (+91 ${cleanPhone})`
      : `✓ 6-Digit OTP sent via SMS to +91 ${cleanPhone}`;

    return NextResponse.json({
      success: true,
      channel: isWhatsApp ? 'whatsapp' : 'sms',
      message,
      // Demo OTP in development / sandbox:
      demoOtp: otpCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
