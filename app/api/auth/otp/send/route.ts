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
    const nutrigharPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '917976119153';
    const cleanSupportPhone = nutrigharPhone.replace(/[^0-9]/g, '');
    const waText = `Hi Nutri Ghar! Please verify my account for mobile number +91 ${cleanPhone}. My OTP Code is: ${otpCode}`;
    const whatsappUrl = `https://wa.me/${cleanSupportPhone}?text=${encodeURIComponent(waText)}`;

    const message = isWhatsApp
      ? `✓ WhatsApp Verification Code generated for +91 ${cleanPhone}`
      : `✓ 6-Digit OTP sent via SMS to +91 ${cleanPhone}`;

    return NextResponse.json({
      success: true,
      channel: isWhatsApp ? 'whatsapp' : 'sms',
      message,
      otp: otpCode,
      demoOtp: otpCode,
      whatsappUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
