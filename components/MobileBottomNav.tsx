'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useContent } from '@/context/ContentContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { getItemCount } = useCart();
  const { whatsappLink } = useContent();
  const itemCount = getItemCount();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isShop = pathname.startsWith('/products');
  const isCart = pathname === '/cart';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-2xl safe-area-pb">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center text-center">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? 'text-[#1E382B] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Categories / Shop */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isShop ? 'text-[#1E382B] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill={isShop ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] tracking-tight">Shop</span>
        </Link>

        {/* 3. Cart Bag (With Live Counter Badge) */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
            isCart ? 'text-[#1E382B] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <svg className="w-5 h-5 mb-0.5" fill={isCart ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Bag</span>
        </Link>

        {/* 4. Search */}
        <Link
          href="/products"
          className="flex flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-[10px] tracking-tight">Search</span>
        </Link>

        {/* 5. WhatsApp Support */}
        <a
          href={whatsappLink || 'https://wa.me/917976119153'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs mb-0.5 shadow-xs">
            💬
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 tracking-tight">Chat</span>
        </a>

      </div>
    </div>
  );
}
