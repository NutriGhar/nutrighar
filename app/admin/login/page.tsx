'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@nutrighar.com');
    setPassword('NutriGhar@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#13241C] via-[#1E382B] to-[#13241C] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        
        {/* Centered Brand Mark */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#13241C] flex items-center justify-center font-serif text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
              NG
            </div>
            <div className="text-left">
              <span className="font-serif text-2xl font-bold text-white block leading-tight">
                Nutri Ghar
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D49A4B] font-bold">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Centered Glassmorphic Form Card */}
        <div className="bg-[#FAF7F2] p-8 sm:p-10 rounded-3xl border border-[#E8E1D7] shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-semibold tracking-tight">
              Management Sign In
            </h1>
            <p className="text-xs text-[#6B635B] font-light mt-1">
              Authorized access to products, orders, and website CMS.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
              <span className="text-rose-500 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@nutrighar.com"
                className="w-full px-4 py-3 bg-white border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1E382B] focus:ring-1 focus:ring-[#1E382B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#9C5838] hover:underline font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-white border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1E382B] focus:ring-1 focus:ring-[#1E382B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Access Management Portal →</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-5 border-t border-[#E8E1D7] text-center space-y-2">
            <p className="text-xs text-stone-500 font-light">
              Default Credentials: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-[11px]">admin@nutrighar.com</code>
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE8DE] text-xs font-semibold text-[#1E382B] transition-colors shadow-2xs"
            >
              ✨ Autofill Demo Credentials
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-stone-300 hover:text-white font-medium transition-colors">
            ← Back to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
