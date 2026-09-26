'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { sendOtp, verifyOtp, loginWithPassword, registerWithPassword } = useCustomerAuth();

  // Mode & Method
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form States
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent, channel: 'sms' | 'whatsapp' = 'sms') => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setOtpChannel(channel);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendOtp(cleanPhone, fullName, channel);
      if (res.success) {
        setOtpSent(true);
        setDemoCode(res.demoOtp || '123456');
        setSuccessMsg(
          res.message ||
            (channel === 'whatsapp'
              ? `✓ 6-Digit OTP sent to your WhatsApp (+91 ${cleanPhone})`
              : `✓ 6-Digit OTP sent via SMS to +91 ${cleanPhone}`)
        );
      } else {
        setError(res.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtp(phone, otpCode.trim(), fullName);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.error || 'Invalid OTP code. Please try again.');
      }
    } catch {
      setError('Verification error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'register') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields');
        return;
      }
      try {
        setIsLoading(true);
        const res = await registerWithPassword({
          name: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || undefined,
        });
        if (res.success) router.push(redirectUrl);
        else setError(res.error || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password');
        return;
      }
      try {
        setIsLoading(true);
        const res = await loginWithPassword(email.trim(), password.trim());
        if (res.success) router.push(redirectUrl);
        else setError(res.error || 'Invalid email or password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* =========================================================================
          TOP CURVED SAGE GREEN CONTAINER (EXACT KAPIVA DESIGN FROM SCREENSHOT)
      ========================================================================= */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#A8BD93',
          paddingTop: '36px',
          paddingBottom: '70px',
          borderBottomLeftRadius: '50% 80px',
          borderBottomRightRadius: '50% 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Centered Heading "Login" */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1C2914',
            marginBottom: '24px',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          {authMode === 'login' ? 'Login' : 'Register'}
        </h1>

        {/* Floating White Card (Exact Kapiva Card Dimensions & Styling) */}
        <div
          style={{
            width: '100%',
            maxWidth: '470px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 36px 42px 36px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            boxSizing: 'border-box',
            textAlign: 'center',
            margin: '0 16px',
          }}
        >
          {/* Official Logo Emblem */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/images/nutrighar-logo-emblem.png"
              alt="Nutri Ghar"
              style={{ width: '68px', height: '68px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
          </div>

          {/* Card Title in Warm Terracotta */}
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#B55B32',
              margin: '0 0 8px 0',
            }}
          >
            Welcome to Nutri Ghar!
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '14px',
              color: '#555555',
              margin: '0 0 24px 0',
              lineHeight: '1.5',
              fontWeight: '400',
            }}
          >
            {authMethod === 'otp'
              ? otpSent
                ? `Enter the 6-digit OTP code sent to +91 ${phone}`
                : 'Enter your mobile number and we will send you an OTP for verification.'
              : 'Enter your email and password to access your account.'}
          </p>

          {/* Alert Messages */}
          {error && (
            <div
              style={{
                marginBottom: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '13px',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '13px',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              ✓ {successMsg}
            </div>
          )}

          {/* ================= OPTION 1: MOBILE OTP FLOW ================= */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  {/* Optional/Required Name Field */}
                  <div style={{ marginBottom: '14px' }}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={authMode === 'register' ? 'Full Name *' : 'Your Name (e.g. Apoorv)'}
                      required={authMode === 'register'}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        border: '1.5px solid #6E8B4C',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#222',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Field 1: India Box (Exact Kapiva Style) */}
                  <div
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      border: '1.5px solid #6E8B4C',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* SVG Indian Flag */}
                      <svg width="24" height="16" viewBox="0 0 900 600" style={{ borderRadius: '2px', display: 'block' }}>
                        <rect width="900" height="200" fill="#FF9933" />
                        <rect y="200" width="900" height="200" fill="#FFFFFF" />
                        <rect y="400" width="900" height="200" fill="#138808" />
                        <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                      </svg>
                      <span style={{ fontSize: '15px', fontWeight: '500', color: '#222' }}>India (+91)</span>
                    </div>
                  </div>

                  {/* Field 2: Mobile Input with Telephone Outline Icon (Exact Kapiva Style) */}
                  <div
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      border: '1.5px solid #6E8B4C',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                    }}
                  >
                    <svg width="20" height="20" fill="none" stroke="#6E8B4C" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      required
                      maxLength={10}
                      placeholder="10-digit Mobile Number"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        color: '#222',
                        backgroundColor: 'transparent',
                        padding: 0,
                      }}
                    />
                  </div>

                  {/* Send via WhatsApp Button */}
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleSendOtp(e, 'whatsapp')}
                      disabled={isLoading || phone.length !== 10}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: phone.length === 10 ? '#F0FDF4' : '#F9FAFB',
                        border: phone.length === 10 ? '1.5px solid #22C55E' : '1.5px solid #E5E7EB',
                        color: phone.length === 10 ? '#15803D' : '#9CA3AF',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      <span>Send OTP via WhatsApp</span>
                    </button>
                  </div>

                  {/* Circular Green Arrow Button for SMS OTP (Kapiva Style) */}
                  <button
                    type="submit"
                    disabled={isLoading || phone.length !== 10}
                    aria-label="Get OTP via SMS"
                    title="Get OTP via SMS"
                    style={{
                      position: 'absolute',
                      bottom: '-28px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#5C7A38',
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                      opacity: phone.length === 10 ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      zIndex: 10,
                    }}
                  >
                    {isLoading ? (
                      <span style={{ width: '20px', height: '20px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <svg width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit OTP */
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E382B' }}>Enter OTP</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: otpChannel === 'whatsapp' ? '#DCFCE7' : '#FEF3C7', color: otpChannel === 'whatsapp' ? '#15803D' : '#92400E', fontWeight: '700' }}>
                          {otpChannel === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setError(null);
                        }}
                        style={{ fontSize: '12px', color: '#B55B32', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Change (+91 {phone})
                      </button>
                    </div>

                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        height: '52px',
                        border: '2px solid #5C7A38',
                        borderRadius: '8px',
                        textAlign: 'center',
                        letterSpacing: '0.4em',
                        fontSize: '24px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        color: '#1E382B',
                        backgroundColor: '#F9FAF7',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {demoCode && (
                    <div
                      style={{
                        marginBottom: '12px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#92400E',
                      }}
                    >
                      <span>Demo OTP: <strong>{demoCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoCode)}
                        style={{ fontWeight: '700', color: '#5C7A38', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Autofill OTP
                      </button>
                    </div>
                  )}

                  {/* Resend Option Toggle */}
                  <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                    {otpChannel === 'sms' ? (
                      <button
                        type="button"
                        onClick={(e) => handleSendOtp(e, 'whatsapp')}
                        disabled={isLoading}
                        style={{ fontSize: '12px', color: '#15803D', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>💬 Didn&apos;t get SMS? Resend via WhatsApp</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSendOtp(e, 'sms')}
                        disabled={isLoading}
                        style={{ fontSize: '12px', color: '#5C7A38', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>📱 Resend via regular SMS instead</span>
                      </button>
                    )}
                  </div>

                  {/* Circular Button for Verification */}
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    aria-label="Verify OTP"
                    style={{
                      position: 'absolute',
                      bottom: '-28px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#5C7A38',
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed',
                      opacity: otpCode.length === 6 ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      zIndex: 10,
                    }}
                  >
                    {isLoading ? (
                      <span style={{ width: '20px', height: '20px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <svg width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================= OPTION 2: EMAIL & PASSWORD ================= */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordAuth}>
              {authMode === 'register' && (
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Full Name"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      border: '1.5px solid #6E8B4C',
                      borderRadius: '8px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email Address"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    border: '1.5px solid #6E8B4C',
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '10px', position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 45px 0 16px',
                    border: '1.5px solid #6E8B4C',
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#6E8B4C',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Circular Button for Email Submit */}
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Submit"
                style={{
                  position: 'absolute',
                  bottom: '-28px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#5C7A38',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 10,
                }}
              >
                {isLoading ? (
                  <span style={{ width: '20px', height: '20px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <svg width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* =========================================================================
          BOTTOM SECTION: "What makes Nutri Ghar special?" (Exact Kapiva Style)
      ========================================================================= */}
      <div style={{ width: '100%', maxWidth: '800px', padding: '60px 16px 40px 16px', textAlign: 'center', boxSizing: 'border-box' }}>
        
        {/* Toggle Mode */}
        <div style={{ marginBottom: '32px' }}>
          {authMode === 'login' ? (
            <p style={{ fontSize: '14px', color: '#444' }}>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{ color: '#5C7A38', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register with Nutri Ghar
              </button>
            </p>
          ) : (
            <p style={{ fontSize: '14px', color: '#444' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{ color: '#5C7A38', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In to Account
              </button>
            </p>
          )}

          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod(authMethod === 'otp' ? 'password' : 'otp');
                setError(null);
                setSuccessMsg(null);
              }}
              style={{ fontSize: '12px', color: '#666', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {authMethod === 'otp' ? '✉️ Sign in with Email & Password instead' : '📱 Sign in with Mobile OTP instead'}
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1C2914', marginBottom: '24px' }}>
          What makes Nutri Ghar special?
        </h3>

        {/* 4 Feature Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAF7', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🍯</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', textTransform: 'uppercase' }}>100% Pure Ghee</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Pure A2 desi cow ghee</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAF7', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🥜</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', textTransform: 'uppercase' }}>Stone Ground</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Roasted peanuts, zero palm oil</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAF7', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🚫</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', textTransform: 'uppercase' }}>No Preservatives</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Zero chemical additives</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAF7', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🚚</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', textTransform: 'uppercase' }}>Fresh Batch</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Small batch preparation</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', backgroundColor: '#A8BD93', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #5C7A38', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
