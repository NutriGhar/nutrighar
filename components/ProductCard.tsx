'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import ProductWhatsAppInquiryModal from '@/components/ProductWhatsAppInquiryModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
  const productHref = `/products/${product.id || product.slug}`;

  // Calculate discount percentage if originalPrice exists
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="group h-full bg-white rounded-2xl border border-stone-200 hover:border-[#4E652B]/40 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container - Clickable Link */}
        <Link
          href={productHref}
          className="block relative w-full h-40 sm:h-60 bg-[#FAF7F2] overflow-hidden cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgError ? fallbackImage : (product.image || fallbackImage)}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
            {product.featured && (
              <span className="bg-[#1E382B] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-xs">
                Bestseller
              </span>
            )}
            {discountPercent && (
              <span className="bg-[#9C5838] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-xs">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Star Rating Overlay */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-xs text-stone-900 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-xs">
            <span className="text-amber-500">★</span>
            <span>{product.rating || '4.9'}</span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-3 sm:p-5">
          {/* Category Pill */}
          <div className="mb-1 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 font-medium">
            <span className="uppercase tracking-wider font-semibold text-[#9C5838] truncate max-w-[120px]">
              {product.category === 'mithai' && 'Desi Mithai'}
              {product.category === 'peanut-butter' && 'Peanut Butter'}
              {product.category === 'protein-nutrition' && 'High Protein'}
              {product.category === 'healthy-snacks' && 'Roasted Snacks'}
              {product.category && !['mithai', 'peanut-butter', 'protein-nutrition', 'healthy-snacks'].includes(product.category) &&
                (product.categorySlug || product.category)}
              {!product.category && (product.categorySlug || 'Homemade')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-400 hidden sm:inline">Fresh Batch</span>
          </div>

          {/* Clickable Title */}
          <Link href={productHref} className="block group-hover:text-[#4E652B] transition-colors">
            <h3 className="font-serif text-xs sm:text-base lg:text-lg font-normal text-stone-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Description snippet (Desktop only for clean mobile alignment) */}
          <p className="hidden sm:block text-xs text-stone-500 line-clamp-2 font-light mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & CTA */}
      <div className="p-3 sm:p-5 pt-0">
        <div className="pt-2 sm:pt-3 border-t border-stone-100 space-y-2 sm:space-y-3">
          {/* Price Row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base sm:text-2xl font-bold text-[#1E382B]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              In Stock
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              title="Ask on WhatsApp"
              className="p-2 sm:p-2.5 bg-[#FAF7F2] hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.817-.168.75.75 0 01-.168-.817c.214-.652.383-1.332.502-2.03C3.655 16.485 3 14.341 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </button>

            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 shadow-xs hover:shadow cursor-pointer ${
                showAddedMessage
                  ? 'bg-[#2A4F3C] text-white'
                  : 'bg-[#4E652B] hover:bg-[#3D5021] text-white'
              }`}
            >
              {showAddedMessage ? (
                <>
                  <span>✓</span>
                  <span>Added</span>
                </>
              ) : (
                <>
                  <span>+</span>
                  <span className="sm:hidden">Add</span>
                  <span className="hidden sm:inline">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <ProductWhatsAppInquiryModal
        product={product}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
}
