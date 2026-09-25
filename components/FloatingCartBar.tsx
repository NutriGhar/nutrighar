'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingCartBar() {
  const { getItemCount, getTotal } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not show on /admin or /cart or /checkout pages
  if (!mounted || pathname?.startsWith('/admin') || pathname === '/cart' || pathname === '/checkout') {
    return null;
  }

  const itemCount = getItemCount();
  const subtotal = getTotal();

  if (itemCount === 0) {
    return null;
  }

  return (
    <aside aria-label="Quick Cart" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-slideUp">
      <Link
        href="/cart"
        className="flex items-center justify-between px-5 py-3.5 bg-[#1E382B] text-white rounded-full shadow-2xl border border-[#2A4F3C] hover:bg-[#2A4F3C] transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5B56A] text-[#1E382B] flex items-center justify-center font-bold text-xs shadow-inner">
            {itemCount}
          </div>
          <div>
            <div className="text-xs text-stone-300 font-medium">
              {itemCount === 1 ? '1 Item in Cart' : `${itemCount} Items in Cart`}
            </div>
            <div className="text-sm font-bold text-white tracking-wide">
              ₹{subtotal.toFixed(0)} <span className="text-[11px] font-normal text-stone-300">(incl. taxes)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E5B56A] group-hover:text-white transition-colors">
          <span>View Cart</span>
          <span className="group-hover:translate-x-1 transition-transform text-sm">→</span>
        </div>
      </Link>
    </aside>
  );
}
