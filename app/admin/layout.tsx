'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  // If on /admin/login, render login page directly without admin chrome
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1E382B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#6B635B] font-semibold">
            Loading Nutri Ghar Admin...
          </p>
        </div>
      </div>
    );
  }

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
      active: pathname === '/admin',
    },
    {
      name: 'Products Catalog',
      href: '/admin/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      active: pathname.startsWith('/admin/products') && pathname !== '/admin/products/new',
    },
    {
      name: 'Add New Product',
      href: '/admin/products/new',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      active: pathname === '/admin/products/new',
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.375v4.5A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25v-4.5m-19.5 0v-6.75A2.25 2.25 0 014.5 5.25h4.125a2.25 2.25 0 011.591.659l1.637 1.636a2.25 2.25 0 001.591.66h5.806A2.25 2.25 0 0121 10.5v3.375" />
        </svg>
      ),
      active: pathname === '/admin/categories',
    },
    {
      name: 'Customer Orders',
      href: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      active: pathname === '/admin/orders',
    },
    {
      name: 'Website Content',
      href: '/admin/content',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      active: pathname === '/admin/content',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex text-[#1C1917] font-sans antialiased">
      
      {/* Desktop Sidebar (Clean, High-Contrast Dark Forest) */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#112219] text-white flex-shrink-0 z-30 shadow-xl border-r border-[#1E382B]">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#112219] flex items-center justify-center font-serif text-lg font-extrabold shadow-md shrink-0">
            NG
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-white block leading-tight tracking-tight">
              Nutri Ghar
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5B56A] font-bold">
              Owner Management
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 px-3 pb-2">
            Store Management
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                item.active
                  ? 'bg-[#2A4F3C] text-white shadow-md border border-[#3E6B54]'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={item.active ? 'text-[#E5B56A]' : 'text-stone-400'}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-5 border-t border-white/10 space-y-4 bg-black/20">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-white transition-colors border border-white/15 shadow-xs"
          >
            <span>View Live Storefront</span>
            <span>↗</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[130px]">
                {adminUser?.name || 'Administrator'}
              </span>
              <span className="text-[11px] text-stone-400 truncate max-w-[130px]">
                {adminUser?.email || 'admin@nutrighar.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-xs text-rose-300 font-bold border border-rose-700/40 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-18 bg-white border-b border-stone-200 flex items-center justify-between px-6 sm:px-10 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <span className="font-serif text-lg font-bold text-stone-900 hidden sm:inline">
              Store Control Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-xs text-emerald-900 font-bold border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Live Database Connected</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1E382B] hover:text-[#9C5838] uppercase tracking-wider py-1.5 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <span>Live Store</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden bg-[#112219] text-white p-6 space-y-3 border-b border-white/10 z-30 shadow-2xl animate-fadeIn">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  item.active ? 'bg-[#2A4F3C] text-white shadow-md' : 'text-stone-300'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <Link href="/" target="_blank" className="text-xs text-[#E5B56A] font-bold">
                Open Storefront ↗
              </Link>
              <button onClick={handleLogout} className="text-xs text-rose-400 font-bold cursor-pointer">
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Page Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
