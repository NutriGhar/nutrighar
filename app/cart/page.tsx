'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import CartItemComponent from '@/components/CartItem';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';

const DEFAULT_UPSELLS: Product[] = [
  {
    id: 'besan-ladoo',
    name: 'Besan Ladoo',
    slug: 'besan-ladoo',
    price: 299,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    description: 'Authentic gram flour ladoos handcrafted with pure A2 desi cow ghee and cardamom.',
    rating: 4.8,
  },
  {
    id: 'dry-fruit-ladoo',
    name: 'Premium Dry Fruit Ladoo',
    slug: 'dry-fruit-ladoo',
    price: 549,
    originalPrice: 649,
    image: '/images/dry-fruit-ladoo-product.jpg',
    description: 'Luxurious ladoos packed with almonds, cashews, dates, and zero refined sugar.',
    rating: 4.9,
  },
  {
    id: 'clean-protein',
    name: '100% Clean Plant Protein',
    slug: 'clean-protein',
    price: 599,
    originalPrice: 699,
    image: '/images/clean-protein-pouch-product.jpg',
    description: 'Plant-based clean protein blend with natural cocoa and zero artificial sweeteners.',
    rating: 4.8,
  },
  {
    id: 'peanut-butter',
    name: 'Classic Creamy Peanut Butter',
    slug: 'peanut-butter',
    price: 249,
    originalPrice: 279,
    image: '/images/peanut-butter-product.jpg',
    description: 'Stone-ground slow roasted peanuts with zero palm oil and zero preservatives.',
    rating: 4.7,
  },
];

export default function CartPage() {
  const { items, getTotal, clearCart, addItem } = useCart();
  const [upsells, setUpsells] = useState<Product[]>(DEFAULT_UPSELLS);
  const [addedItemIds, setAddedItemIds] = useState<{ [key: string]: boolean }>({});

  const subtotal = getTotal();
  const mrpTotal = Math.round(subtotal * 1.12);
  const mrpDiscount = mrpTotal - subtotal;
  const deliveryCharge = subtotal > 500 ? 0 : 60;
  const total = subtotal + deliveryCharge;
  const savings = mrpDiscount + (deliveryCharge === 0 ? 60 : 0);

  // Fetch real products from catalog for dynamic recommendations
  useEffect(() => {
    async function fetchUpsells() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        const allProducts: Product[] = Array.isArray(json)
          ? json
          : json.data || json.products || DEFAULT_UPSELLS;
        if (allProducts && allProducts.length > 0) {
          // Filter out items already in the basket
          const available = allProducts.filter(
            (p: Product) => !items.some((cartItem) => cartItem.id === p.id || cartItem.slug === p.slug)
          );
          setUpsells(available.length > 0 ? available.slice(0, 4) : allProducts.slice(0, 2));
        }
      } catch (e) {
        console.error('Error fetching upsell products:', e);
        const available = DEFAULT_UPSELLS.filter(
          (p) => !items.some((cartItem) => cartItem.id === p.id || cartItem.slug === p.slug)
        );
        setUpsells(available.length > 0 ? available.slice(0, 4) : DEFAULT_UPSELLS.slice(0, 2));
      }
    }
    fetchUpsells();
  }, [items]);

  const handleAddUpsell = (product: Product) => {
    addItem(product, 1);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="text-6xl">🛒</div>
          <h1 className="text-2xl font-bold text-stone-900">Your basket is empty</h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Add pure homemade mithais, stone-ground nut butters, or roasted nut mixes to get started.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-md bg-[#5C7A38] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4E672F] transition-colors"
          >
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 antialiased pb-20">

      {/* Clean Minimal Header (Kapiva style) */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-stone-800 hover:text-stone-600">
            <span className="text-lg">←</span>
            <span>My Basket</span>
          </Link>
          <Link href="/">
            <div className="bg-black text-white px-3.5 py-1.5 rounded-sm font-sans tracking-[0.2em] font-extrabold text-xs uppercase">
              NUTRI GHAR
            </div>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ====================================================
              LEFT: Cart Items + Upsell
          ==================================================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* Cart Items Card */}
            <div className="border border-stone-200 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900">
                  My Basket ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="px-5">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Free Delivery Progress Bar */}
            {subtotal < 500 && (
              <div className="border border-stone-200 rounded-xl bg-white px-5 py-4 space-y-2">
                <div className="flex justify-between text-xs text-stone-600 font-medium">
                  <span>Add ₹{500 - subtotal} more for <span className="font-bold text-emerald-700">FREE Delivery</span></span>
                  <span className="text-stone-400">₹{subtotal} / ₹500</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div
                    className="bg-[#5C7A38] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {subtotal >= 500 && (
              <div className="border border-emerald-200 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
                <span>🚚</span>
                <span>You've unlocked <strong>FREE Delivery</strong>!</span>
              </div>
            )}

            {/* You May Also Like (Upsell) */}
            {upsells.length > 0 && (
              <div className="border border-stone-200 rounded-2xl bg-white shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">You May Also Like</h3>
                    <p className="text-[11px] text-stone-500">Pure, healthy additions recommended for your order</p>
                  </div>
                  <Link href="/products" className="text-xs font-bold text-[#4E652B] hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upsells.map((u) => {
                    const originalPrice = u.originalPrice || Math.round(u.price * 1.15);
                    const discountPercent = Math.round(((originalPrice - u.price) / originalPrice) * 100);
                    const isAdded = !!addedItemIds[u.id];

                    return (
                      <div
                        key={u.id}
                        className="border border-stone-200/90 rounded-2xl p-3.5 space-y-3 relative bg-[#FAF7F2]/40 hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        {discountPercent > 0 && (
                          <span className="absolute top-3 right-3 z-10 bg-[#E7F0AB] text-[#243513] text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                            {discountPercent}% OFF
                          </span>
                        )}

                        <div>
                          <Link href={`/products/${u.id}`} className="block relative w-full h-32 rounded-xl overflow-hidden bg-white border border-stone-200/60 mb-2.5">
                            <Image
                              src={u.image || '/images/nutrighar-clean-protein-pouch-square.jpg'}
                              alt={u.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 250px"
                            />
                          </Link>

                          <Link href={`/products/${u.id}`} className="block">
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1 hover:text-[#4E652B] transition-colors">
                              {u.name}
                            </h4>
                          </Link>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-extrabold text-[#1E382B]">₹{u.price}</span>
                            {originalPrice > u.price && (
                              <span className="text-xs text-stone-400 line-through">₹{originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Proper Green Clickable Button */}
                        <button
                          type="button"
                          onClick={() => handleAddUpsell(u)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                            isAdded
                              ? 'bg-[#2E5E16] text-white shadow-inner'
                              : 'bg-[#4E652B] hover:bg-[#3D5021] text-white hover:shadow-md'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <span className="text-sm">✓</span>
                              <span>Added to Basket</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-black">+</span>
                              <span>ADD TO CART</span>
                            </>
                          )}
                        </button>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ====================================================
              RIGHT: Price Summary + CTA (sticky)
          ==================================================== */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">

            {/* Price Breakdown Card */}
            <div className="border border-stone-200 rounded-xl bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                Price Summary
              </h3>

              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Total MRP ({items.length} items)</span>
                  <span className="font-semibold text-stone-900">₹{mrpTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount on MRP</span>
                  <span>− ₹{mrpDiscount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      <span className="text-stone-900">₹{deliveryCharge}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-stone-900">₹{total}</span>
              </div>

              {/* Savings Badge */}
              {savings > 0 && (
                <div className="p-2.5 rounded-lg bg-[#EBF4E5] text-[#3B5A24] text-xs font-bold flex items-center justify-center gap-2">
                  <span>🎉</span>
                  <span>You&apos;re saving ₹{savings} on this order!</span>
                </div>
              )}

              {/* CTA */}
              <Link
                href="/checkout"
                className="block w-full py-4 bg-[#5C7A38] hover:bg-[#4E672F] text-white text-sm font-bold uppercase tracking-wider text-center rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Proceed to Checkout →
              </Link>

              <Link
                href="/products"
                className="block text-center text-xs text-stone-500 hover:text-stone-800 font-semibold transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="border border-stone-200 rounded-xl bg-white px-5 py-4">
              <div className="grid grid-cols-2 gap-3 text-center text-[11px] text-stone-500 font-medium">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">🚚</span>
                  <span>Free Shipping above ₹500</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">🌿</span>
                  <span>100% All Natural</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">🔄</span>
                  <span>Fresh Batch Guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">👥</span>
                  <span>Trusted by 10,000+</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
