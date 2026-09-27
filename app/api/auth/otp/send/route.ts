import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/customerAuth';

/**
 * Optional SMS gateway integration (e.g. Fast2SMS / Twilio)
 * If FAST2SMS_API_KEY is defined in .env, sends real SMS to the user's mobile number.
 */
async function sendSmsToCustomer(phone: string, otpCode: string): Promise<boolean> {
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (!fast2SmsKey) {
    return false;
  }

  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
      fast2SmsKey
    )}&route=otp&variables_values=${encodeURIComponent(otpCode)}&numbers=${encodeURIComponent(
      phone
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'cache-control': 'no-cache' },
    });
    const result = await response.json();
    return !!result.return;
  } catch (err) {
    console.error('Failed to send SMS to customer phone:', err);
    return false;
  }
}

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

    // Send real SMS to the user's mobile number if SMS Gateway API key is configured
    await sendSmsToCustomer(cleanPhone, otpCode);

    return NextResponse.json({
      success: true,
      message: `✓ 6-Digit OTP sent to +91 ${cleanPhone}`,
      otp: otpCode,
      demoOtp: otpCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
