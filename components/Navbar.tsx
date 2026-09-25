'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function Navbar() {
  const { getItemCount, getTotal } = useCart();
  const { customer, logout } = useCustomerAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItemCount(getItemCount());
    setCartTotal(getTotal());
  }, [getItemCount, getTotal]);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsShopDropdownOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Do not render customer navbar on /admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navigateToCategory = (catSlug: string) => {
    setIsShopDropdownOpen(false);
    setIsMenuOpen(false);
    if (catSlug) {
      router.push(`/products?category=${encodeURIComponent(catSlug)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-2xs">
      {/* Top Announcement Banner */}
      <div className="bg-[#E7F0AB] text-[#243513] text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase">
        <span className="hidden sm:inline">
          FREE DELIVERY FOR ORDERS ABOVE RS 500 • 100% PURE HOMEMADE NUTRITION
        </span>
        <span className="sm:hidden">
          FREE DELIVERY ABOVE RS 500 • 100% PURE GHEE
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          
          {/* Mobile Left: Hamburger Menu Button (lg:hidden) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 -ml-1 flex items-center justify-center text-stone-800 hover:text-[#4E652B] hover:bg-stone-100 rounded-full focus:outline-none cursor-pointer transition-colors"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Brand Logo: Centered on Mobile, Left-aligned on Desktop */}
          <div className="flex-1 flex justify-center lg:justify-start lg:flex-initial z-10">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-xs border border-stone-200 bg-white shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/nutrighar-logo-emblem.png"
                  alt="Nutri Ghar Logo Emblem"
                  fill
                  className="object-cover"
                  sizes="48px"
                  priority
                />
              </div>
              <div className="bg-black text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md font-sans tracking-[0.16em] sm:tracking-[0.2em] font-black text-[11px] sm:text-sm uppercase shadow-sm flex items-center gap-1 hover:opacity-95 transition-opacity">
                <span className="text-white">NUTRI</span>
                <span className="text-[#E5B56A]">GHAR</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links: 100% Dead Center on the Page */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2 z-20 text-xs xl:text-[13px] font-bold uppercase tracking-wider text-stone-700">
            
            {/* SHOP Multi-Column Mega Menu */}
            <div
              ref={shopDropdownRef}
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                className={`py-3.5 inline-flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 font-bold uppercase tracking-wider ${
                  isShopDropdownOpen
                    ? 'text-[#4E652B] border-[#4E652B]'
                    : 'text-stone-800 border-transparent hover:text-[#4E652B]'
                }`}
              >
                <span>SHOP</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isShopDropdownOpen ? 'rotate-180 text-[#4E652B]' : 'text-stone-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Ultra Clean Spacious Mega Menu Dropdown */}
              {isShopDropdownOpen && (
                <div
                  className="absolute top-full -left-16 w-[640px] bg-white rounded-b-2xl shadow-2xl border-x border-b border-stone-200/90 py-10 px-12 z-50 animate-fadeIn"
                >
                  <div className="grid grid-cols-2 gap-x-16 gap-y-5">
                    
                    {/* Left Column */}
                    <div className="flex flex-col space-y-4 text-[13px] font-medium tracking-[0.12em] text-stone-700">
                      <Link
                        href="/products?category=mithai"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        GHEE &amp; MITHAI
                      </Link>

                      <Link
                        href="/products?category=mithai"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        BESAN &amp; MOTICHOOR LADOOS
                      </Link>

                      <Link
                        href="/products?category=peanut-butter"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        PEANUT BUTTER &amp; SPREADS
                      </Link>

                      <Link
                        href="/products?category=protein-nutrition"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        HIGH PROTEIN
                      </Link>

                      <Link
                        href="/products?category=healthy-snacks"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        DRY FRUITS &amp; NUTS
                      </Link>

                      <Link
                        href="/products?category=healthy-snacks"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        ROASTED SNACKS
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        HOMEMADE ESSENTIALS
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col space-y-4 text-[13px] font-medium tracking-[0.12em] text-stone-700">
                      <Link
                        href="/products?category=mithai"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        NO REFINED SUGAR / JAGGERY
                      </Link>

                      <Link
                        href="/products?category=protein-nutrition"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        CLEAN PROTEIN TREATS
                      </Link>

                      <Link
                        href="/products?category=healthy-snacks"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        SUPERFOOD SEEDS
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        FRESH WEEKLY BATCHES
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        HOMEMADE GIFTING
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase"
                      >
                        DAILY NUTRITION FOR KIDS
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setIsShopDropdownOpen(false)}
                        className="text-left hover:text-[#4E652B] hover:translate-x-1 transition-all uppercase text-[#4E652B] font-bold"
                      >
                        VIEW ALL PRODUCTS →
                      </Link>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <Link
              href="/products?category=mithai"
              className="hover:text-[#4E652B] transition-colors py-2 whitespace-nowrap"
            >
              Mithai &amp; Ladoos
            </Link>
            <Link
              href="/products?category=peanut-butter"
              className="hover:text-[#4E652B] transition-colors py-2 whitespace-nowrap"
            >
              Peanut Butter
            </Link>
            <Link
              href="/products?category=protein-nutrition"
              className="hover:text-[#4E652B] transition-colors py-2 whitespace-nowrap"
            >
              Protein
            </Link>
            <Link href="/about" className="hover:text-[#4E652B] transition-colors py-2 whitespace-nowrap">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-[#4E652B] transition-colors py-2 whitespace-nowrap">
              Contact
            </Link>
          </nav>

          {/* Right Side: Search, Account & Cart Icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 z-10">
            
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-stone-800 hover:text-[#4E652B] hover:bg-stone-100 rounded-full transition-all cursor-pointer"
              aria-label="Search"
              title="Search"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            
            {/* User Account Icon Button (Hidden on tiny mobile screens, accessible in drawer and bottom nav) */}
            <div ref={userMenuRef} className="relative hidden sm:block">
              {customer ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-stone-800 hover:text-[#4E652B] hover:bg-stone-100 rounded-full transition-all cursor-pointer relative"
                  aria-label="Account"
                  title={customer.name}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#526E2D] ring-2 ring-white" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-stone-800 hover:text-[#4E652B] hover:bg-stone-100 rounded-full transition-all"
                  aria-label="Login"
                  title="Login / Register"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}

              {/* Customer Dropdown */}
              {isUserMenuOpen && customer && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <div className="font-bold text-stone-900 truncate">{customer.name}</div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {customer.phone ? `+91 ${customer.phone}` : customer.email}
                    </div>
                  </div>
                  <Link
                    href="/cart"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-stone-50 text-stone-800 font-medium"
                  >
                    🛒 My Basket ({itemCount})
                  </Link>
                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 font-bold border-t border-stone-100 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Bag / Cart Icon Button with Badge */}
            <Link
              href="/cart"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-stone-800 hover:text-[#4E652B] hover:bg-stone-100 rounded-full transition-all relative"
              aria-label="Cart"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute bottom-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-black rounded-full shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

          </div>

        </div>

        {/* Expandable Clean Search Bar (Slides down smoothly when Search Icon is clicked) */}
        {isSearchOpen && (
          <div className="py-2.5 px-2 border-t border-stone-100 bg-[#FAF7F2] animate-slideDown flex items-center justify-center">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full max-w-2xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ladoos, peanut butter, protein mixes..."
                className="w-full pl-4 pr-20 py-2.5 bg-white border-2 border-[#4E652B] rounded-full text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none shadow-md"
              />
              <button
                type="submit"
                className="absolute right-8 px-3 py-1 bg-[#4E652B] text-white hover:bg-[#3D5021] text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2.5 w-5 h-5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================
          Mobile Navigation Slide Drawer (Opens from Left)
      ======================================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[85vw] max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 animate-slideRight overflow-hidden text-[#1C1917]">
            
            {/* Drawer Header */}
            <div className="p-4 flex items-center justify-between border-b border-stone-200 bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-white">
                  <Image
                    src="/images/nutrighar-logo-emblem.png"
                    alt="Nutri Ghar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-black text-white px-2.5 py-1 rounded text-[11px] font-black tracking-widest uppercase">
                  <span>NUTRI </span>
                  <span className="text-[#E5B56A]">GHAR</span>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 hover:text-stone-900 transition-colors cursor-pointer text-sm font-bold shadow-2xs"
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Drawer Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products & recipes..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#4E652B]"
                />
                <span className="absolute left-3 top-2.5 text-stone-400 text-sm">🔍</span>
              </form>

              {/* Login / Customer Card */}
              {customer ? (
                <div className="bg-[#4E652B] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      👤
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-stone-200 font-light">Signed in as</div>
                      <div className="font-bold text-xs truncate">{customer.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logout();
                    }}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold tracking-wider transition-colors cursor-pointer uppercase"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-[#1E382B] hover:bg-[#2A4F3C] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="font-bold text-xs">Customer Login / Sign Up</div>
                      <div className="text-[10px] text-stone-200 font-light">Track orders and fast checkout</div>
                    </div>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              )}

              {/* Categories Section */}
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9C5838] block px-1">
                  Shop Categories
                </span>
                <div className="space-y-1">
                  <Link
                    href="/products?category=mithai"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">🍯</span> Pure Desi Ghee Mithai &amp; Ladoos
                    </span>
                    <span className="text-stone-400">›</span>
                  </Link>

                  <Link
                    href="/products?category=peanut-butter"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">🥜</span> Stone-Ground Peanut Butter
                    </span>
                    <span className="text-stone-400">›</span>
                  </Link>

                  <Link
                    href="/products?category=protein-nutrition"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">💪</span> High Protein &amp; Fitness
                    </span>
                    <span className="text-stone-400">›</span>
                  </Link>

                  <Link
                    href="/products?category=healthy-snacks"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">🌰</span> Roasted Nuts &amp; Superfood Snacks
                    </span>
                    <span className="text-stone-400">›</span>
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-[#4E652B] text-stone-900 hover:text-white font-bold text-xs transition-colors mt-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>🛍️</span> All Fresh Homemade Batches
                    </span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Kitchen Story & Support Links */}
              <div className="pt-2 border-t border-stone-200 space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 block px-1">
                  Discover Nutri Ghar
                </span>
                
                <Link
                  href="/#story"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-stone-100 text-stone-700 font-medium text-xs transition-colors"
                >
                  <span>📖</span> Our Heritage Story &amp; Craft
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-stone-100 text-stone-700 font-medium text-xs transition-colors"
                >
                  <span>ℹ️</span> About Us &amp; Standards
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-stone-100 text-stone-700 font-medium text-xs transition-colors"
                >
                  <span>📞</span> Contact &amp; Order Inquiries
                </Link>

                {/* Direct WhatsApp Support */}
                <a
                  href="https://wa.me/919876543210?text=Hi%20Nutri%20Ghar,%20I%20have%20an%20inquiry%20regarding%20fresh%20batches."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs transition-colors mt-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-600 text-sm">💬</span> Chat on WhatsApp
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700">Quick Reply →</span>
                </a>
              </div>

            </div>

            {/* Drawer Trust Badges Footer */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-stone-200 text-[10px] text-stone-500 text-center font-medium space-y-1">
              <div>🍃 100% Pure Desi Ghee • 🚫 Zero Palm Oil</div>
              <div>FSSAI Registered Artisanal Kitchen</div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          Mobile Bottom Navigation Bar (Matching Reference Images 1 & 4)
      ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden shadow-2xl">
        
        {/* FREE Delivery Pill & Cart Summary Bar (When not on cart/checkout) */}
        {pathname !== '/cart' && pathname !== '/checkout' && (
          <div className="flex flex-col">
            {/* Free Shipping Pill Sub-header */}
            <div className="bg-[#D4E79E] text-[#1E382B] text-[10px] font-bold py-1 px-4 text-center tracking-wide">
              🌿 FREE Shipping on all orders above ₹500
            </div>

            {/* Olive Green Cart Quick Bar */}
            <Link
              href="/cart"
              className="bg-[#4E652B] hover:bg-[#3D5021] text-white px-4 py-2 flex items-center justify-between transition-colors shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <span>🛒</span>
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-xs">
                <span>₹{cartTotal}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] group-hover:bg-white/30 transition-colors inline-flex items-center gap-1">
                  <span>Cart</span>
                  <span>▶</span>
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* 5 Bottom Nav Items (Cream Background with Olive Active Icons) */}
        <div className="grid grid-cols-5 py-2 px-1 text-center bg-[#FAF7F2] border-t border-stone-200">
          <Link
            href="/products?featured=true"
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              pathname === '/products' ? 'text-[#4E652B]' : 'text-stone-600 hover:text-[#4E652B]'
            }`}
          >
            <span className="text-base leading-none">🏷️</span>
            <span>Offers</span>
          </Link>

          <Link
            href="/products"
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              pathname === '/products' ? 'text-[#4E652B]' : 'text-stone-600 hover:text-[#4E652B]'
            }`}
          >
            <span className="text-base leading-none">📂</span>
            <span>Categories</span>
          </Link>

          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              pathname === '/' ? 'text-[#4E652B]' : 'text-stone-600 hover:text-[#4E652B]'
            }`}
          >
            <span className="text-base leading-none">🏠</span>
            <span>Shop</span>
          </Link>

          <Link
            href={customer ? '/cart' : '/login'}
            className="flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-600 hover:text-[#4E652B] transition-colors"
          >
            <span className="text-base leading-none">👤</span>
            <span>{customer ? 'Account' : 'Login'}</span>
          </Link>

          <a
            href="https://wa.me/919876543210?text=Hi%20Nutri%20Ghar,%20I%20have%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span className="text-base leading-none">💬</span>
            <span>Help</span>
          </a>
        </div>
      </div>

    </header>
  );
}
