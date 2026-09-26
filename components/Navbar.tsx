'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useContent } from '@/context/ContentContext';
import { Product } from '@/types/product';

const POPULAR_SEARCHES = ['Besan Ladoo', 'Peanut Butter', 'Clean Protein', 'Dry Fruit Ladoo', 'Pure Desi Ghee', 'Healthy Snacks'];

export default function Navbar() {
  const { getItemCount, getTotal } = useCart();
  const { customer, logout, updateProfile } = useCustomerAuth();
  const { content, whatsappLink } = useContent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItemCount(getItemCount());
    setCartTotal(getTotal());
  }, [getItemCount, getTotal]);

  useEffect(() => {
    if (customer) {
      setEditName(customer.name?.startsWith('User +91') ? '' : customer.name || '');
      setEditEmail(customer.email?.includes('@phone.nutrighar.com') ? '' : customer.email || '');
    }
  }, [customer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileMsg({ type: 'error', text: 'Please enter your name' });
      return;
    }
    try {
      setIsSavingProfile(true);
      setProfileMsg(null);
      const res = await updateProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
      });
      if (res.success) {
        setProfileMsg({ type: 'success', text: '✓ Name updated successfully!' });
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileMsg(null);
        }, 1200);
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Failed to update name' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Error updating name' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Fetch catalog for instantaneous 0ms live search
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        const list: Product[] = Array.isArray(json) ? json : json.data || json.products || [];
        setCatalogProducts(list);
      } catch (e) {
        console.error('Failed to load products for live search:', e);
      }
    }
    loadCatalog();
  }, []);

  // Live filter results as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = catalogProducts.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const catMatch = p.categorySlug?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
      const ingMatch = Array.isArray(p.ingredients) && p.ingredients.some((ing) => ing.toLowerCase().includes(q));
      return nameMatch || descMatch || catMatch || ingMatch;
    });
    setSearchResults(filtered);
  }, [searchQuery, catalogProducts]);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsShopDropdownOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Focus search input and listen to Escape key when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsSearchOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
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
      {content?.announcement?.enabled !== false && (
        <div className="bg-[#E7F0AB] text-[#243513] text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase">
          <span>
            {content?.announcement?.text || 'FREE DELIVERY FOR ORDERS ABOVE RS 500 • 100% PURE HOMEMADE NUTRITION'}
          </span>
        </div>
      )}

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
            
            {/* User Account Icon Button & Dropdown */}
            <div ref={userMenuRef} className="relative hidden sm:block">
              {customer ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer group"
                  aria-label="Account"
                  title={customer.name || 'My Account'}
                >
                  <div className="w-7 h-7 rounded-full bg-[#1E382B] text-[#E7F0AB] font-bold text-xs flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    {customer.name && !customer.name.startsWith('User +91') && customer.name !== 'Customer'
                      ? customer.name.charAt(0).toUpperCase()
                      : '👤'}
                  </div>
                  <span className="text-xs font-bold text-stone-800 max-w-[90px] truncate hidden md:inline-block">
                    {customer.name && !customer.name.startsWith('User +91') && customer.name !== 'Customer'
                      ? customer.name.split(' ')[0]
                      : 'Account'}
                  </span>
                  <svg className={`w-3 h-3 text-stone-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
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

              {/* Luxury Customer Dropdown Menu */}
              {isUserMenuOpen && customer && (
                <div className="absolute right-0 top-full mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-2 px-2 z-50 animate-fadeIn text-xs">
                  
                  {/* Customer Card Header */}
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200/60 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#1E382B] text-[#E7F0AB] font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                        {customer.name && !customer.name.startsWith('User +91') && customer.name !== 'Customer'
                          ? customer.name.charAt(0).toUpperCase()
                          : '🌿'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-stone-900 text-sm truncate">
                          {customer.name && !customer.name.startsWith('User +91')
                            ? customer.name
                            : 'Valued Customer'}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium truncate flex items-center gap-1 mt-0.5">
                          <span>{customer.phone ? `+91 ${customer.phone}` : customer.email}</span>
                          <span className="text-emerald-600 font-bold" title="Verified Customer">✓</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsEditProfileOpen(true);
                      }}
                      className="mt-2.5 w-full py-1.5 px-2.5 bg-white hover:bg-stone-50 text-[#4E652B] hover:text-[#3D5021] border border-stone-200/80 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>✏️</span> Edit Profile / Change Name
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5 py-1">
                    <Link
                      href="/cart"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-800 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🛒</span> My Basket
                      </span>
                      {itemCount > 0 ? (
                        <span className="bg-[#4E652B] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          {itemCount}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[10px]">Empty</span>
                      )}
                    </Link>

                    <Link
                      href="/checkout"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-800 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>📦</span> Checkout &amp; Tracking
                      </span>
                      <span className="text-stone-400">›</span>
                    </Link>

                    <Link
                      href="/#story"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-800 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>📖</span> NutriGhar Kitchen Story
                      </span>
                      <span className="text-stone-400">›</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1.5 mt-1 border-t border-stone-100">
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-bold transition-colors cursor-pointer text-left"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>

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

        {/* Mobile Sticky Search Bar (Permanent on all mobile screens for easy 1-tap searching) */}
        <div className="lg:hidden px-4 pb-2.5 pt-0.5 bg-white border-t border-stone-100">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#FAF7F2] hover:bg-stone-100 border border-stone-200/90 rounded-full text-stone-500 text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#4E652B] text-sm">🔍</span>
              <span className="truncate text-stone-600 font-medium">Search ladoos, peanut butter, protein...</span>
            </div>
            <span className="shrink-0 bg-[#E7F0AB] text-[#243513] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Search
            </span>
          </button>
        </div>

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
              
              {/* Drawer Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-stone-100 border border-stone-300/80 rounded-xl text-xs text-stone-600 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-[#4E652B]">🔍</span>
                  <span className="font-semibold text-stone-700">Search products &amp; recipes...</span>
                </div>
                <span className="text-[10px] font-bold text-[#4E652B] bg-[#E7F0AB] px-2 py-0.5 rounded-full uppercase">
                  Search
                </span>
              </button>

              {/* Login / Customer Card */}
              {customer ? (
                <div className="bg-[#1E382B] text-white p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#E7F0AB] text-[#1E382B] flex items-center justify-center text-sm font-black shadow-xs">
                        {customer.name && !customer.name.startsWith('User +91') && customer.name !== 'Customer'
                          ? customer.name.charAt(0).toUpperCase()
                          : '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-stone-300 font-medium">Welcome back,</div>
                        <div className="font-extrabold text-xs truncate text-[#FAF7F2]">
                          {customer.name && !customer.name.startsWith('User +91') ? customer.name : 'Valued Customer'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await logout();
                      }}
                      className="px-2.5 py-1 bg-white/10 hover:bg-rose-900/50 text-stone-200 hover:text-rose-200 rounded-lg text-[10px] font-bold tracking-wider transition-colors cursor-pointer uppercase"
                    >
                      Sign Out
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditProfileOpen(true);
                    }}
                    className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>✏️</span> Edit Name / Profile
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
                  href={whatsappLink}
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
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span className="text-base leading-none">💬</span>
            <span>Help</span>
          </a>
        </div>
      </div>

      {/* ========================================================
          Edit Profile Modal
      ======================================================== */}
      {isEditProfileOpen && customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#FAF7F2] border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E382B] text-[#E7F0AB] font-bold text-base flex items-center justify-center shadow-xs">
                  {editName ? editName.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Your Profile</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Update your display name &amp; details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditProfileOpen(false);
                  setProfileMsg(null);
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors cursor-pointer text-sm font-bold shadow-2xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold text-center ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name (e.g. Apoorv)"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-stone-300 focus:border-[#4E652B] focus:bg-white rounded-xl text-sm font-semibold text-stone-900 outline-none transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-stone-300 focus:border-[#4E652B] focus:bg-white rounded-xl text-sm font-medium text-stone-900 outline-none transition-colors"
                />
              </div>

              {/* Phone Number (Verified) */}
              {customer.phone && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Verified Mobile Number
                  </label>
                  <div className="px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 flex items-center justify-between">
                    <span>+91 {customer.phone}</span>
                    <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>✓</span> Verified
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    setProfileMsg(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile || !editName.trim()}
                  className="flex-1 py-2.5 px-4 bg-[#4E652B] hover:bg-[#3D5021] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Luxury Instant Live Search Overlay Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 animate-fadeIn overflow-y-auto"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-2 sm:my-6 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="p-3.5 sm:p-5 border-b border-stone-200 bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Search Bar Container (Flex Layout to guarantee 0 text-overlap) */}
                <div className="flex-1 flex items-center bg-[#FAF7F2] border-2 border-stone-300/90 focus-within:border-[#4E652B] focus-within:bg-white rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all shadow-inner gap-2.5 sm:gap-3">
                  <svg
                    className="w-5 h-5 text-[#4E652B] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mithai, peanut butter, clean protein..."
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-base font-semibold text-stone-900 placeholder:text-stone-400 p-0 focus:ring-0"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
                      title="Clear search query"
                      aria-label="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="hidden sm:inline-flex items-center justify-center px-5 py-3 sm:py-3.5 bg-[#4E652B] hover:bg-[#3D5021] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Search
                </button>

                {/* Close Search Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-sm sm:text-base font-bold transition-colors cursor-pointer shrink-0"
                  aria-label="Close Search"
                  title="Close (ESC)"
                >
                  ✕
                </button>
              </div>

              {/* Trending Quick Chips */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                  🔥 Trending:
                </span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="px-2.5 sm:px-3 py-1 bg-[#FAF7F2] hover:bg-[#E7F0AB] hover:text-[#243513] text-stone-700 rounded-full text-[11px] sm:text-xs font-medium border border-stone-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            {/* Scrollable Results / Recommendations Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF7F2]/40">
              {searchQuery.trim() ? (
                <div>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-3.5 px-1">
                    <span className="text-xs sm:text-sm font-bold text-stone-700">
                      {searchResults.length > 0 ? (
                        <>
                          Found <span className="text-[#4E652B] font-extrabold">{searchResults.length}</span> {searchResults.length === 1 ? 'item' : 'items'} for &ldquo;{searchQuery}&rdquo;
                        </>
                      ) : (
                        `No items found for "${searchQuery}"`
                      )}
                    </span>
                    {searchResults.length > 0 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="text-xs font-bold text-[#4E652B] hover:underline"
                      >
                        View in Catalog →
                      </Link>
                    )}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="bg-white p-3 rounded-2xl border border-stone-200/90 hover:border-[#4E652B] hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
                        >
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl bg-stone-200 text-stone-400">
                                🥣
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[#9C5838] block truncate">
                              {product.category || 'NutriGhar Homemade'}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate group-hover:text-[#4E652B] transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-black text-xs sm:text-sm text-[#4E652B]">
                                ₹{product.price}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-stone-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                              {product.rating && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-auto">
                                  ★ {product.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                      <div className="text-4xl">🔍</div>
                      <h4 className="text-sm sm:text-base font-bold text-stone-800">
                        No products found matching &ldquo;{searchQuery}&rdquo;
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Check your spelling or explore our popular homemade nutrition categories below.
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-2">
                        {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setSearchQuery(term)}
                            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E7F0AB] text-stone-800 text-xs font-semibold rounded-full border border-stone-300 transition-colors cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty / Initial State: Category & Best Sellers Discovery */
                <div className="space-y-6">
                  {/* Category Fast Shortcuts */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3 px-1">
                      Explore Categories
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <Link
                        href="/products?category=mithai"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-3.5 bg-white hover:bg-[#FAF7F2] border border-stone-200/90 hover:border-[#4E652B] rounded-2xl transition-all flex items-center gap-3 group shadow-2xs"
                      >
                        <span className="text-2xl p-2 bg-amber-50 rounded-xl">🍯</span>
                        <div>
                          <div className="font-bold text-xs text-stone-900 group-hover:text-[#4E652B]">
                            Pure Ghee Mithai
                          </div>
                          <div className="text-[10px] text-stone-500">Ladoos &amp; Treats</div>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=peanut-butter"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-3.5 bg-white hover:bg-[#FAF7F2] border border-stone-200/90 hover:border-[#4E652B] rounded-2xl transition-all flex items-center gap-3 group shadow-2xs"
                      >
                        <span className="text-2xl p-2 bg-amber-50 rounded-xl">🥜</span>
                        <div>
                          <div className="font-bold text-xs text-stone-900 group-hover:text-[#4E652B]">
                            Peanut Butter
                          </div>
                          <div className="text-[10px] text-stone-500">Stone-ground, 100% pure</div>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=protein-nutrition"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-3.5 bg-white hover:bg-[#FAF7F2] border border-stone-200/90 hover:border-[#4E652B] rounded-2xl transition-all flex items-center gap-3 group shadow-2xs"
                      >
                        <span className="text-2xl p-2 bg-emerald-50 rounded-xl">🌿</span>
                        <div>
                          <div className="font-bold text-xs text-stone-900 group-hover:text-[#4E652B]">
                            Clean Protein
                          </div>
                          <div className="text-[10px] text-stone-500">Zero artificial additives</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Featured / Best Sellers Preview */}
                  {catalogProducts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                          Popular NutriGhar Favorites
                        </h4>
                        <Link
                          href="/products"
                          onClick={() => setIsSearchOpen(false)}
                          className="text-[11px] font-bold text-[#4E652B] hover:underline"
                        >
                          View All ({catalogProducts.length}) →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {catalogProducts.slice(0, 4).map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="bg-white p-3 rounded-2xl border border-stone-200/90 hover:border-[#4E652B] hover:shadow-sm transition-all flex items-center gap-3 group"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg bg-stone-200">
                                  🥣
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-stone-900 truncate group-hover:text-[#4E652B]">
                                {p.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-black text-xs text-[#4E652B]">₹{p.price}</span>
                                {p.rating && (
                                  <span className="text-[10px] text-amber-600 font-semibold">★ {p.rating}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-stone-400 group-hover:text-[#4E652B] group-hover:translate-x-0.5 transition-all">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
              <span className="hidden sm:inline">
                💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded font-mono text-[10px]">ESC</kbd> anytime to close search.
              </span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider text-xs ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}

