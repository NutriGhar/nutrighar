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
      return;
    }

    if (!formData.fullName || !formData.address || !formData.city || !formData.pincode) {
      setShowAddressForm(true);
      setOrderError('Please complete your delivery address details.');
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
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl">🛒</div>
          <h1 className="text-2xl font-bold text-stone-900">Your Basket is Empty</h1>
          <p className="text-sm text-stone-600">
            Explore our artisanal Indian mithais, roasted nuts, and stone-ground nut butters.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-md bg-[#1E2C14] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Start Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased pb-20">
      
      {/* =========================================================================
          TOP MINIMAL HEADER (EXACT KAPIVA CHECKOUT HEADER)
      ========================================================================= */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-stone-800 hover:text-stone-600 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Checkout</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-black text-white px-3.5 py-1.5 rounded-sm font-sans tracking-[0.2em] font-extrabold text-xs uppercase">
              NUTRI GHAR
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {orderError && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
            ⚠️ {orderError}
          </div>
        )}

        {/* 2-Column Kapiva Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* =========================================================================
              LEFT COLUMN (60%): Verify Number + Coupons + Payment Method + Delivery
          ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* SECTION 1: VERIFY NUMBER TO PROCEED */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Verify your number to proceed
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-normal">
                We&apos;ll fetch your saved addresses to make checkout quicker
              </p>

              {customer ? (
                <div className="p-4 rounded-lg bg-[#F5F8F2] border border-[#A8BD93] flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">✓ Phone Verified:</span>
                    <span className="font-bold text-stone-900">+91 {customer.phone || phone}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                    Active
                  </span>
                </div>
              ) : !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="Phone No."
                        required
                        maxLength={10}
                        className="w-full h-12 px-4 border border-stone-300 rounded-md text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || phone.length !== 10}
                      className="w-14 h-12 bg-stone-300 hover:bg-[#5C7A38] text-white rounded-md flex items-center justify-center font-bold text-lg disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {authLoading ? '...' : '→'}
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 accent-[#5C7A38] rounded"
                    />
                    <span>Continue with Nutri Ghar T&amp;C &amp; privacy policy</span>
                  </label>

                  {/* Security Notice Pill */}
                  <div className="p-2.5 rounded bg-[#F4F8F1] text-[11px] text-[#3B5A24] font-medium flex items-center gap-2">
                    <span>🛡️</span>
                    <span>We use your number only to get your saved addresses via OTP</span>
                  </div>
                </form>
              ) : (
                /* Step 1.2: Enter OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">Enter 6-digit OTP sent to +91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#5C7A38] font-bold underline"
                    >
                      Change
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
                      className="flex-1 h-12 text-center text-xl font-bold tracking-[0.3em] font-mono border-2 border-[#5C7A38] rounded-md focus:outline-none bg-stone-50"
                    />
                    <button
                      type="submit"
                      disabled={authLoading || otpCode.length !== 6}
                      className="px-6 h-12 bg-[#5C7A38] hover:bg-[#4E672F] text-white rounded-md font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>

                  {demoCode && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded flex justify-between">
                      <span>Demo OTP: <strong>{demoCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoCode)}
                        className="font-bold underline text-[#5C7A38]"
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

            {/* SECTION 2: COUPONS */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Coupons</h3>
                <p className="text-xs text-stone-500">
                  Earn 5% Nutri Ghar Coins on every order.{' '}
                  <Link href="/login" className="text-[#5C7A38] font-bold underline">
                    Login Now
                  </Link>
                </p>
              </div>

              {/* Coupon input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 h-11 px-4 border border-stone-300 rounded-md text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={() => applyCouponHandler(couponCode)}
                  className="px-6 h-11 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Featured Voucher Badge */}
              <div className="flex border border-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-[#5C7A38] text-white text-[10px] font-bold px-2 py-3 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest">
                  15% Off
                </div>
                <div className="flex-1 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>🏷️</span>
                      <span>NUTRI15</span>
                    </div>
                    <div className="text-xs text-stone-500">Up to 15% off on all products</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCouponHandler('NUTRI15')}
                    className="text-xs font-bold text-[#5C7A38] hover:text-[#435B24] uppercase cursor-pointer"
                  >
                    {appliedCoupon === 'NUTRI15' ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: DELIVERY ADDRESS (Expandable/Clean) */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Doorstep Delivery Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-[#5C7A38] underline cursor-pointer"
                >
                  {showAddressForm ? 'Hide Details' : '+ Edit Address'}
                </button>
              </div>

              {showAddressForm ? (
                <div className="space-y-3 p-4 rounded-lg bg-stone-50 border border-stone-200 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Priya Sharma"
                        className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="9876543210"
                        className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Street Address / House No *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="House No, Apartment, Landmark"
                      className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-dashed border-stone-300 text-xs text-stone-600 flex items-center justify-between">
                  <span>
                    {formData.address
                      ? `${formData.address}, ${formData.city} - ${formData.pincode}`
                      : 'No delivery address added yet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="font-bold text-[#5C7A38] uppercase"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 4: CHOOSE PAYMENT METHOD */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-lg font-bold text-stone-900">Choose Payment Method</h3>

              <div className="border border-stone-300 rounded-xl overflow-hidden divide-y divide-stone-200">
                {/* Option 1: Pay Online */}
                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    paymentMethod === 'online' ? 'bg-[#FAFBF9]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 accent-[#5C7A38]"
                    />
                    <div>
                      <div className="text-sm font-bold text-stone-900">Pay online</div>
                      <div className="text-xs text-[#B55B32] font-semibold">
                        Save an additional 5%, up to Rs 100.
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    ₹{(subtotal - couponDiscount - Math.round(subtotal * 0.05) + deliveryCharge).toFixed(2)}
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'bg-[#FAFBF9]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 accent-[#5C7A38]"
                    />
                    <div className="text-sm font-bold text-stone-900">Cash on delivery</div>
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    ₹{(subtotal - couponDiscount + deliveryCharge).toFixed(2)}
                  </div>
                </label>
              </div>

              {/* Online discount hint */}
              {paymentMethod === 'online' && (
                <p className="text-xs text-center text-[#B55B32] font-semibold">
                  Enjoy the extra 5% online payment discount!
                </p>
              )}

              {/* Main CTA Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full h-14 rounded-lg bg-[#5C7A38] hover:bg-[#4E672F] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <span>Place Order • ₹{grandTotal.toFixed(2)} →</span>
                )}
              </button>

              {/* Trust Badges Bar (Kapiva Style) */}
              <div className="pt-6 space-y-4">
                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-[#5C7A38]">
                  🔒 100% SECURE PAYMENTS &amp; GUARANTEE
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-stone-600 font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🚚</span>
                    <span>Free Shipping above ₹500</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🔄</span>
                    <span>Fresh Batch Replacement</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🌿</span>
                    <span>100% All Natural</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">👥</span>
                    <span>Trusted by 10,000+</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN (40%): Order Summary + Upsell + Price Summary Accordion
          ========================================================================= */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            
            {/* 1. ORDER SUMMARY CARD */}
            <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-stone-900">Order Summary</h3>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-50 border border-stone-200 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. ADD FOR BETTER RESULTS (Upsell Slider) */}
            <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Add for better results</h4>
                <p className="text-[11px] text-stone-500">Pair with your daily wellness routine</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {upsellItems.map((u) => (
                  <div key={u.id} className="border border-stone-200 rounded-lg p-2.5 space-y-2 relative bg-stone-50/50">
                    <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {u.discount}
                    </span>
                    <div className="relative w-full h-24 rounded-md overflow-hidden bg-white">
                      <Image src={u.image} alt={u.name} fill className="object-cover" sizes="120px" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 truncate">{u.name}</div>
                      <div className="flex items-center gap-1.5">
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
                      className="w-full py-1.5 bg-stone-900 hover:bg-[#5C7A38] text-white text-[11px] font-bold uppercase rounded transition-colors"
                    >
                      + ADD
                    </button>
                  </div>
                ))}
              </div>

              {/* Nutri Ghar Coins Strip */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-700 border-t border-stone-100">
                <span>Earn 🪙 <strong>{coinsEarned} Nutri Ghar Coins</strong></span>
                <span className="text-[10px] text-stone-500">(1 Coin = ₹1 Discount)</span>
              </div>
            </div>

            {/* 3. PRICE SUMMARY ACCORDION */}
            <div className="border border-stone-200 rounded-xl p-5 bg-white shadow-xs space-y-3 text-xs">
              <h4 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
                Price Summary
              </h4>

              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Total MRP:</span>
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
                    <span>Online Payment Discount (5%):</span>
                    <span>- ₹{onlineDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping (Free above ₹500):</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>GST (Inclusive):</span>
                  <span>₹{((grandTotal * 0.05)).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                <span className="text-sm font-bold">Grand Total:</span>
                <span className="text-2xl font-extrabold text-stone-900">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Green Savings Ribbon */}
              <div className="p-2.5 rounded-lg bg-[#EBF4E5] text-[#3B5A24] text-xs font-bold flex items-center justify-center gap-2">
                <span>🎉</span>
                <span>You&apos;ll save ₹{totalSavings} on this order</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
