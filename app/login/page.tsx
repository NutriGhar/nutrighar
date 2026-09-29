'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { sendOtp, verifyOtp, loginWithPassword, registerWithPassword } = useCustomerAuth();

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    try {
      setIsLoading(true);
      const res = await sendOtp(cleanPhone, fullName, 'sms');
      if (res.success) {
        setOtpSent(true);
        setDemoCode(res.otp || res.demoOtp || '123456');
        setSuccessMsg(res.message || `OTP sent to +91 ${cleanPhone}`);
      } else { setError(res.error || 'Failed to send OTP.'); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.trim().length < 6) { setError('Please enter the 6-digit OTP code'); return; }
    try {
      setIsLoading(true);
      const res = await verifyOtp(phone, otpCode.trim(), fullName);
      if (res.success) router.push(redirectUrl);
      else setError(res.error || 'Invalid OTP code. Please try again.');
    } catch { setError('Verification error. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (authMode === 'register') {
      if (!fullName.trim() || !email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
      try {
        setIsLoading(true);
        const res = await registerWithPassword({ name: fullName.trim(), email: email.trim(), password: password.trim(), phone: phone.trim() || undefined });
        if (res.success) router.push(redirectUrl);
        else setError(res.error || 'Registration failed');
      } finally { setIsLoading(false); }
    } else {
      if (!email.trim() || !password.trim()) { setError('Please enter your email and password'); return; }
      try {
        setIsLoading(true);
        const res = await loginWithPassword(email.trim(), password.trim());
        if (res.success) router.push(redirectUrl);
        else setError(res.error || 'Invalid email or password');
      } finally { setIsLoading(false); }
    }
  };

  const features = [
    { icon: '🍯', title: '100% Pure A2 Ghee', desc: 'Traditional desi cow ghee in every product' },
    { icon: '🥜', title: 'Stone Ground Daily', desc: 'Fresh roasted peanuts, zero palm oil' },
    { icon: '🚫', title: 'No Preservatives', desc: 'Zero chemical additives or fillers' },
    { icon: '🚚', title: 'Fresh Small Batches', desc: 'Crafted fresh, delivered to your door' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#1E382B] text-white px-3 py-1.5 rounded font-black tracking-[0.18em] text-xs uppercase">
            NUTRI <span className="text-[#E5B56A]">GHAR</span>
          </div>
        </Link>
        <Link href="/products" className="text-xs font-semibold text-stone-500 hover:text-[#1E382B] transition-colors">
          Continue Shopping →
        </Link>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── LEFT PANEL: Brand visual (desktop only) ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1E382B] relative overflow-hidden flex-col items-center justify-center p-12">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white"
                style={{ width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-sm">
            {/* Logo */}
            <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <Image src="/images/nutrighar-logo-emblem.png" alt="Nutri Ghar" width={96} height={96} className="object-cover" />
            </div>

            <h2 className="text-3xl font-serif font-bold text-white mb-3 leading-tight">
              Pure. Homemade.<br />
              <span className="text-[#E5B56A] italic">Delivered with Love.</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              Handcrafted Indian foods made with pure A2 ghee, whole ingredients, and zero industrial shortcuts.
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.title} className="bg-white/10 rounded-2xl p-4 text-left border border-white/10">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-white text-xs font-bold mb-0.5">{f.title}</div>
                  <div className="text-white/60 text-[11px]">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                {['🙂', '😊', '😄'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <div className="text-white/80 text-xs">
                <span className="font-bold text-white">4.9★</span> from 800+ happy families
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Auth form ── */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1E382B]/20">
                <Image src="/images/nutrighar-logo-emblem.png" alt="Nutri Ghar" width={56} height={56} className="object-cover" />
              </div>
              <div>
                <div className="font-black text-lg text-[#1E382B] tracking-wider">NUTRI GHAR</div>
                <div className="text-xs text-stone-500">Pure Homemade Nutrition</div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2">
                {authMode === 'login' ? 'Welcome back 👋' : 'Create your account'}
              </h1>
              <p className="text-sm text-stone-500 leading-relaxed">
                {authMethod === 'otp'
                  ? otpSent
                    ? `Enter the 6-digit OTP sent to +91 ${phone}`
                    : 'Enter your mobile number — we\'ll send you an OTP instantly.'
                  : authMode === 'register'
                    ? 'Fill in your details to join the Nutri Ghar family.'
                    : 'Enter your email and password to sign in.'}
              </p>
            </div>

            {/* Auth method toggle */}
            <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${authMethod === 'otp' ? 'bg-white text-[#1E382B] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                📱 Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${authMethod === 'password' ? 'bg-white text-[#1E382B] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                ✉️ Email & Password
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-start gap-2">
                <span className="mt-0.5">⚠️</span><span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-start gap-2">
                <span className="mt-0.5">✅</span><span>{successMsg}</span>
              </div>
            )}

            {/* ── OTP FLOW ── */}
            {authMethod === 'otp' && (
              <>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {/* Name field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        {authMode === 'register' ? 'Full Name *' : 'Your Name (optional)'}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        required={authMode === 'register'}
                        className="w-full h-12 px-4 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:border-[#1E382B] focus:ring-2 focus:ring-[#1E382B]/10 transition-all"
                      />
                    </div>

                    {/* Phone field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Mobile Number *</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          <svg width="20" height="14" viewBox="0 0 900 600">
                            <rect width="900" height="200" fill="#FF9933" />
                            <rect y="200" width="900" height="200" fill="#FFFFFF" />
                            <rect y="400" width="900" height="200" fill="#138808" />
                            <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="12" />
                          </svg>
                          <span className="text-sm font-bold text-stone-700">+91</span>
                          <span className="text-stone-300">|</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          required
                          maxLength={10}
                          className="w-full h-12 pl-24 pr-4 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 placeholder:font-normal placeholder:text-stone-400 bg-white focus:outline-none focus:border-[#1E382B] focus:ring-2 focus:ring-[#1E382B]/10 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phone.length !== 10}
                      className="w-full h-13 bg-[#1E382B] hover:bg-[#2A4F3C] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3.5"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Send OTP <span>→</span></>
                      )}
                    </button>

                    <p className="text-center text-xs text-stone-400 leading-relaxed">
                      🔒 Your number is used only for OTP verification & order updates
                    </p>
                  </form>
                ) : (
                  /* OTP Verify Step */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600">Enter 6-Digit OTP</label>
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError(null); }}
                        className="text-xs font-bold text-[#1E382B] hover:underline">
                        ← Change number
                      </button>
                    </div>

                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      required maxLength={6} autoFocus
                      placeholder="• • • • • •"
                      className="w-full h-16 text-center text-3xl font-bold font-mono tracking-[0.5em] border-2 border-[#1E382B] rounded-2xl focus:outline-none bg-white text-[#1E382B]"
                    />

                    {demoCode && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <span>📱</span><span>Your Verification OTP</span>
                          </div>
                          <span className="font-mono font-black text-lg text-emerald-700">{demoCode}</span>
                        </div>
                        <button type="button"
                          onClick={async () => {
                            setOtpCode(demoCode);
                            try { setIsLoading(true); const r = await verifyOtp(phone, demoCode, fullName); if (r.success) router.push(redirectUrl); else setError(r.error || 'Failed'); } finally { setIsLoading(false); }
                          }}
                          className="w-full py-2.5 bg-[#1E382B] hover:bg-[#2A4F3C] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                          ⚡ 1-Tap Verify & Continue
                        </button>
                      </div>
                    )}

                    <button type="submit" disabled={isLoading || otpCode.length !== 6}
                      className="w-full py-3.5 bg-[#1E382B] hover:bg-[#2A4F3C] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Verify & Continue →</>}
                    </button>

                    <div className="text-center">
                      <button type="button" onClick={() => handleSendOtp()} disabled={isLoading}
                        className="text-xs text-[#1E382B] font-semibold hover:underline">
                        🔄 Resend OTP to +91 {phone}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* ── PASSWORD FLOW ── */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Priya Sharma"
                      className="w-full h-12 px-4 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#1E382B] focus:ring-2 focus:ring-[#1E382B]/10 transition-all" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Email Address *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com"
                    className="w-full h-12 px-4 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#1E382B] focus:ring-2 focus:ring-[#1E382B]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters"
                      className="w-full h-12 pl-4 pr-16 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#1E382B] focus:ring-2 focus:ring-[#1E382B]/10 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1E382B] hover:text-[#2A4F3C]">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 bg-[#1E382B] hover:bg-[#2A4F3C] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2">
                  {isLoading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>{authMode === 'login' ? 'Sign In →' : 'Create Account →'}</>}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Toggle login/register */}
            <div className="text-center space-y-2">
              {authMode === 'login' ? (
                <p className="text-sm text-stone-600">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }}
                    className="font-bold text-[#1E382B] hover:underline">Register Free →</button>
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
                    className="font-bold text-[#1E382B] hover:underline">Sign In →</button>
                </p>
              )}
            </div>

            {/* Mobile trust badges */}
            <div className="lg:hidden mt-10 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-4 border border-stone-200 flex items-start gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{f.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-stone-200 bg-white py-4 px-6 text-center">
        <p className="text-xs text-stone-400">
          🔒 Your data is secure. We never share personal information.{' '}
          <Link href="/" className="text-[#1E382B] font-semibold hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#1E382B] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
