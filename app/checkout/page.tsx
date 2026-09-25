'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, getTotal, addItem, updateQuantity, clearCart } = useCart();
  const { customer, sendOtp, verifyOtp } = useCustomerAuth();
  const router = useRouter();

  // Mobile Order Summary Accordion toggle
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Phone & OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  });

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Pre-fill if customer logs in
  useEffect(() => {
    if (customer) {
      setPhone(customer.phone || '');
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || customer.name || '',
        phone: prev.phone || customer.phone || '',
        email: prev.email || (customer.email?.includes('@phone.nutrighar.com') ? '' : customer.email || ''),
        address: prev.address || customer.address || '',
        city: prev.city || customer.city || 'Mumbai',
        state: prev.state || customer.state || 'Maharashtra',
        pincode: prev.pincode || customer.postalCode || '400001',
      }));
      setShowAddressForm(true);
    }
  }, [customer]);

  // Calculations
  const subtotal = getTotal();
  const mrpTotal = subtotal * 1.15; // 15% MRP comparison
  const mrpDiscount = mrpTotal - subtotal;
  const onlineDiscount = paymentMethod === 'online' ? Math.round(subtotal * 0.05) : 0; // 5% extra discount for online
  const deliveryCharge = subtotal > 500 ? 0 : 60;
  const grandTotal = Math.max(0, subtotal - couponDiscount - onlineDiscount + deliveryCharge);
  const totalSavings = Math.round(mrpDiscount + couponDiscount + onlineDiscount);
  const coinsEarned = Math.round(grandTotal * 0.05);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setOtpSent(true);
        setDemoCode(res.demoOtp || '123456');
      } else {
        setAuthError(res.error || 'Failed to send OTP');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setAuthError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await verifyOtp(phone, otpCode.trim());
      if (res.success) {
        setShowAddressForm(true);
      } else {
        setAuthError(res.error || 'Invalid OTP code');
      }
    } catch {
      setAuthError('Verification error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Apply Coupon
  const applyCouponHandler = (code: string) => {
    if (code.toUpperCase() === 'NUTRI15' || code.toUpperCase() === 'PAYDAY15') {
      const disc = Math.round(subtotal * 0.15);
      setAppliedCoupon(code.toUpperCase());
      setCouponDiscount(disc);
      setCouponCode('');
    } else {
      setAuthError('Invalid coupon code. Try NUTRI15');
    }
  };

  // Submit Order
  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (!customer && !phone) {
      setOrderError('Please enter and verify your mobile number first.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.fullName || !formData.address || !formData.city || !formData.pincode) {
      setShowAddressForm(true);
      setOrderError('Please complete your delivery address details.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerName: formData.fullName || customer?.name || 'Valued Customer',
        customerEmail: formData.email || `${phone || customer?.phone}@phone.nutrighar.com`,
        customerPhone: phone || customer?.phone || formData.phone,
        addressLine1: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.pincode,
        paymentStatus: paymentMethod === 'cod' ? 'COD' : 'Paid',
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          productCategory: item.category,
          productImage: item.image,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOrderError(data.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-success?orderNumber=${data.data.orderNumber}`);
    } catch {
      setOrderError('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Upsell Products
  const upsellItems = [
    {
      id: 'besan-ladoo',
      name: 'Pure Desi Cow Ghee Ladoo',
      price: 299,
      mrp: 349,
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'classic-peanut-butter',
      name: 'Stone-Ground Peanut Butter',
      price: 249,
      mrp: 289,
      discount: '14% OFF',
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80',
    },
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 text-center space-y-5 shadow-sm">
          <div className="text-5xl">🛒</div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Your Basket is Empty</h1>
          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            Explore our handcrafted Indian mithais, roasted nuts, and stone-ground nut butters.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-full bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            Start Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans antialiased pb-32 lg:pb-24">
      
      {/* =========================================================================
          TOP CHECKOUT NAVBAR (Spacious, Clean with SSL Lock)
      ========================================================================= */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 hover:text-[#4E652B] transition-colors"
          >
            <span className="text-base">←</span>
            <span>Return to Cart</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-black text-white px-3 sm:px-4 py-1.5 rounded font-sans tracking-[0.18em] font-black text-xs sm:text-sm uppercase shadow-xs">
              <span>NUTRI </span>
              <span className="text-[#E5B56A]">GHAR</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4E652B] bg-[#F1F6EC] px-2.5 py-1 rounded-full border border-[#D5E5C9]">
            <span>🔒</span>
            <span className="hidden sm:inline">100% Secure</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE COLLAPSIBLE ORDER SUMMARY ACCORDION (Visible only on mobile)
      ========================================================================= */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 shadow-xs">
        <button
          type="button"
          onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span>🛍️</span>
            <span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            <span className="text-stone-400 font-normal">{isOrderSummaryOpen ? '▲ Hide' : '▼ View'}</span>
          </div>
          <span className="font-serif text-sm font-extrabold text-[#1E382B]">
            ₹{grandTotal.toFixed(2)}
          </span>
        </button>

        {isOrderSummaryOpen && (
          <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-fadeIn">
            <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-50 border border-stone-200 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 line-clamp-1">{item.name}</div>
                      <div className="text-[11px] text-stone-500 font-light">
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif text-xs font-bold text-stone-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-emerald-800">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {orderError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span>
            <span>{orderError}</span>
          </div>
        )}

        {/* 2-Column Luxury Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Stepped Checkout Form (Spacious Mobile Cards)
          ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* -------------------------------------------------------------
                STEP 1: PHONE NUMBER & OTP VERIFICATION
            ------------------------------------------------------------- */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#1E382B] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    Contact &amp; Mobile Verification
                  </h2>
                </div>
                {customer && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              {customer ? (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 flex items-center justify-between text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-stone-500 font-light">Verified mobile number</div>
                    <div className="font-bold text-stone-900">+91 {customer.phone || phone}</div>
                  </div>
                  <span className="text-emerald-700 font-bold text-xs">Active Session</span>
                </div>
              ) : !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
                  <p className="text-xs text-stone-500 font-light">
                    Enter your 10-digit mobile number to quickly autofill your saved delivery details.
                  </p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-3 text-xs font-bold text-stone-500">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="Mobile Number"
                        required
                        maxLength={10}
                        className="w-full h-12 pl-12 pr-4 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4E652B] focus:ring-1 focus:ring-[#4E652B] transition-all bg-stone-50/50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || phone.length !== 10}
                      className="px-5 h-12 bg-[#4E652B] hover:bg-[#3D5021] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {authLoading ? 'Sending...' : 'Get OTP →'}
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 accent-[#4E652B] rounded"
                    />
                    <span>Agree to Nutri Ghar T&amp;C and Privacy Policy</span>
                  </label>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] text-[11px] text-stone-600 flex items-center gap-2 border border-stone-200/80">
                    <span className="text-emerald-700 font-bold">🛡️</span>
                    <span>We use your phone number only to send order updates &amp; OTP verification.</span>
                  </div>
                </form>
              ) : (
                /* Step 1.2: Enter OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">Enter 6-digit OTP sent to +91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#4E652B] font-bold underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="••••••"
                      className="flex-1 h-12 text-center text-xl font-bold tracking-[0.3em] font-mono border-2 border-[#4E652B] rounded-xl focus:outline-none bg-stone-50"
                    />
                    <button
                      type="submit"
                      disabled={authLoading || otpCode.length !== 6}
                      className="px-6 h-12 bg-[#4E652B] hover:bg-[#3D5021] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  </div>

                  {demoCode && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex justify-between items-center">
                      <span>Demo Test OTP: <strong>{demoCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoCode)}
                        className="font-bold underline text-[#4E652B] cursor-pointer"
                      >
                        Autofill
                      </button>
                    </div>
                  )}
                </form>
              )}

              {authError && (
                <p className="text-xs font-semibold text-rose-600">{authError}</p>
              )}
            </div>

            {/* -------------------------------------------------------------
                STEP 2: DOORSTEP DELIVERY ADDRESS
            ------------------------------------------------------------- */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#1E382B] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    Delivery Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-[#4E652B] hover:text-[#3D5021] cursor-pointer underline"
                >
                  {showAddressForm ? 'Hide Form' : '+ Edit Address'}
                </button>
              </div>

              {showAddressForm ? (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Priya Sharma"
                        className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || phone}
                        onChange={handleInputChange}
                        required
                        placeholder="10-digit mobile"
                        className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Flat / House No / Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                      className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                    />
                  </div>

                  {/* Responsive City/State/Pincode grid: Stacks neatly on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="City"
                        className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="State"
                        className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        placeholder="6-digit PIN"
                        className="w-full h-11 px-3.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#4E652B] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs sm:text-sm text-stone-700 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900">{formData.fullName || 'Recipient'}</div>
                    <div className="text-stone-600 leading-relaxed">
                      {formData.address ? (
                        `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
                      ) : (
                        <span className="text-stone-400 italic">No delivery address specified yet</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="font-bold text-[#4E652B] hover:text-[#3D5021] text-xs shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                STEP 3: COUPONS & SPECIAL OFFERS
            ------------------------------------------------------------- */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">
                    Apply Coupon Code
                  </h3>
                </div>
                {appliedCoupon && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {appliedCoupon} Applied
                  </span>
                )}
              </div>

              {/* Coupon input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code (e.g. NUTRI15)"
                  className="flex-1 h-11 px-3.5 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4E652B] uppercase bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => applyCouponHandler(couponCode)}
                  className="px-5 h-11 bg-stone-900 hover:bg-[#4E652B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>

              {/* Quick voucher card */}
              <div className="flex border border-stone-200 rounded-2xl overflow-hidden bg-[#FAF7F2] p-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4E652B] text-white flex items-center justify-center font-bold text-xs">
                    %
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">NUTRI15</div>
                    <div className="text-[11px] text-stone-500 font-light">Get 15% instant discount on all fresh batches</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => applyCouponHandler('NUTRI15')}
                  className="px-3 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-[#4E652B] rounded-lg transition-colors cursor-pointer"
                >
                  {appliedCoupon === 'NUTRI15' ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                STEP 4: CHOOSE PAYMENT METHOD
            ------------------------------------------------------------- */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <div className="w-6 h-6 rounded-full bg-[#1E382B] text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Select Payment Option
                </h2>
              </div>

              <div className="space-y-3">
                {/* Option 1: Pay Online */}
                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-[#4E652B] bg-[#F4F8F1]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 accent-[#4E652B]"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span>Pay Online (UPI / GPay / PhonePe / Cards)</span>
                      </div>
                      <div className="text-[11px] text-[#9C5838] font-bold mt-0.5">
                        ⚡ Extra 5% Instant Discount applied
                      </div>
                    </div>
                  </div>
                  <div className="font-serif text-sm sm:text-base font-bold text-[#1E382B]">
                    ₹{(subtotal - couponDiscount - Math.round(subtotal * 0.05) + deliveryCharge).toFixed(2)}
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#4E652B] bg-[#F4F8F1]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 accent-[#4E652B]"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        Cash on Delivery (COD)
                      </div>
                      <div className="text-[11px] text-stone-500 font-light">
                        Pay cash when your order reaches your doorstep
                      </div>
                    </div>
                  </div>
                  <div className="font-serif text-sm sm:text-base font-bold text-stone-900">
                    ₹{(subtotal - couponDiscount + deliveryCharge).toFixed(2)}
                  </div>
                </label>
              </div>

              {/* Desktop CTA Button */}
              <div className="hidden lg:block pt-2">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-[#4E652B] hover:bg-[#3D5021] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <span>Place Order • ₹{grandTotal.toFixed(2)} →</span>
                  )}
                </button>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-4 border-t border-stone-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] sm:text-[11px] text-stone-600 font-medium">
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] flex flex-col items-center gap-1">
                    <span className="text-base">🚚</span>
                    <span>Free Shipping &gt;₹500</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] flex flex-col items-center gap-1">
                    <span className="text-base">🔄</span>
                    <span>Fresh Batch Guarantee</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] flex flex-col items-center gap-1">
                    <span className="text-base">🌿</span>
                    <span>100% Pure Ghee</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] flex flex-col items-center gap-1">
                    <span className="text-base">🔒</span>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Order Summary & Price Breakdown (Desktop Sticky)
          ========================================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* 1. ORDER SUMMARY CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Order Summary</h3>
                <span className="text-xs text-stone-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-stone-500 font-light">
                          ₹{item.price} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-lg shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PRICE SUMMARY ACCORDION */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3.5 text-xs sm:text-sm">
              <h4 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                Payment Summary
              </h4>

              <div className="space-y-2.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Items Total (MRP):</span>
                  <span className="font-semibold text-stone-900">₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount on MRP:</span>
                  <span>- ₹{mrpDiscount.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon}):</span>
                    <span>- ₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === 'online' && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Online Payment (5% Off):</span>
                    <span>- ₹{onlineDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Doorstep Delivery:</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                <div>
                  <span className="text-sm font-bold block">Grand Total:</span>
                  <span className="text-[10px] text-stone-400 font-light">Inclusive of all taxes</span>
                </div>
                <span className="font-serif text-2xl font-extrabold text-[#1E382B]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Green Savings Ribbon */}
              {totalSavings > 0 && (
                <div className="p-3 rounded-2xl bg-[#EBF4E5] text-[#3B5A24] text-xs font-bold flex items-center justify-center gap-2">
                  <span>🎉</span>
                  <span>You are saving ₹{totalSavings} on this order!</span>
                </div>
              )}
            </div>

            {/* 3. ADD FOR BETTER RESULTS (Upsell) */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">Frequently Bought Together</h4>
                <p className="text-[11px] text-stone-500 font-light">Pair with your daily wellness routine</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {upsellItems.map((u) => (
                  <div key={u.id} className="border border-stone-200 rounded-2xl p-2.5 space-y-2 relative bg-[#FAF7F2]">
                    <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {u.discount}
                    </span>
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white">
                      <Image src={u.image} alt={u.name} fill className="object-cover" sizes="120px" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 truncate">{u.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-stone-900">₹{u.price}</span>
                        <span className="text-[10px] text-stone-400 line-through">₹{u.mrp}</span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        addItem(
                          {
                            id: u.id,
                            name: u.name,
                            price: u.price,
                            image: u.image,
                            category: 'healthy-food',
                          } as any,
                          1
                        )
                      }
                      className="w-full py-1.5 bg-[#4E652B] hover:bg-[#3D5021] text-white text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      + ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          FIXED STICKY BOTTOM CHECKOUT ACTION BAR (Mobile Only)
      ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-stone-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Payable</div>
          <div className="font-serif text-lg font-extrabold text-[#1E382B]">
            ₹{grandTotal.toFixed(2)}
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="flex-1 max-w-[220px] h-12 rounded-xl bg-[#4E652B] hover:bg-[#3D5021] active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Placing...</span>
          ) : (
            <span>Place Order →</span>
          )}
        </button>
      </div>

    </div>
  );
}
