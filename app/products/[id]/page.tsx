'use client';

import { useState, useEffect, use } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import ProductWhatsAppInquiryModal from '@/components/ProductWhatsAppInquiryModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${productId}?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();

        if (data.success && data.data) {
          const p = data.data;
          setProduct({
            ...p,
            category: p.categorySlug || p.category,
            reviews: p.reviewCount || p.reviews || 0,
            featured: p.isFeatured !== undefined ? p.isFeatured : p.featured,
          });

          // Fetch related products
          const relRes = await fetch(`/api/products?category=${p.categorySlug || p.category}&active=true&t=${Date.now()}`, { cache: 'no-store' });
          const relData = await relRes.json();
          if (relData.success && relData.data) {
            setRelatedProducts(
              relData.data
                .filter((item: any) => item.id !== p.id && item.slug !== p.slug)
                .slice(0, 4)
            );
          }
        } else {
          setError('Product not found or has been discontinued.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1E382B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#6B635B] font-semibold">
            Loading Product Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E1D7] text-center space-y-4 shadow-sm">
          <span className="text-4xl">🍯</span>
          <h1 className="font-serif text-2xl font-semibold text-[#1C1917]">
            Product Not Found
          </h1>
          <p className="text-sm text-[#6B635B] font-light">
            {error || 'This product may be temporarily unavailable in our catalog.'}
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 rounded-full bg-[#1E382B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A4F3C] transition-colors"
          >
            Explore Catalog →
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock =
    (product.stockQuantity ?? 50) <= (product.lowStockThreshold ?? 10) && !isOutOfStock;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2400);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] pb-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-[#6B635B]">
          <Link href="/" className="hover:text-[#1E382B]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#1E382B]">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#1C1917] font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Product Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[400px] sm:h-[500px] w-full rounded-3xl overflow-hidden bg-[#EBE2D5] border border-[#E8E1D7] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
                }}
              />
              {product.isFeatured && (
                <div className="absolute top-4 left-4 bg-[#1E382B] text-[#FAF7F2] text-[11px] font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Narrative & Purchasing */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C5838] block mb-2 capitalize">
                {(product.categorySlug || product.category || 'Healthy Food').replace('-', ' ')}
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1C1917] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-[#C68841] text-sm">★★★★★</span>
                <span className="font-semibold text-[#1C1917]">{product.rating}</span>
                <span className="text-[#6B635B] font-light">({product.reviews || 0} customer reviews)</span>
              </div>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex items-baseline gap-4 py-3 border-y border-[#E8E1D7]">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1E382B]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-stone-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}

              {/* Stock Status Indicator */}
              <div className="ml-auto">
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    Only {product.stockQuantity} Left!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    In Stock • Fresh Batch
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-[#6B635B] text-base font-light leading-relaxed">
              {product.description}
            </p>

            {/* Ingredients & Benefits */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9C5838]">
                  Wholesome Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#EFE8DE] text-xs font-medium text-[#1C1917]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9C5838]">
                  Health & Wellness Benefits
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#1C1917]">
                      <span className="text-[#1E382B] font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchasing Controls */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#D8CEBE] bg-[#FAF7F2] rounded-full p-1">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-serif font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    disabled={isOutOfStock || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-2xl text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : showAddedMessage
                      ? 'bg-[#2A4F3C] text-white scale-[1.02]'
                      : 'bg-[#526E2D] hover:bg-[#435B24] text-white hover:scale-[1.02]'
                  }`}
                >
                  {isOutOfStock ? (
                    'Sold Out — Fresh Batch Coming Soon'
                  ) : showAddedMessage ? (
                    <>
                      <span>✓</span>
                      <span>Added to Your Basket</span>
                    </>
                  ) : (
                    <>
                      <span>🛒</span>
                      <span>Add to Cart • ₹{product.price * quantity}</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Direct Product Inquiry Button */}
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FAF7F2] hover:bg-emerald-50 border-2 border-[#25D366]/40 hover:border-[#25D366] text-[#1E382B] hover:text-[#128C7E] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs shadow-xs font-bold group-hover:scale-110 transition-transform">
                  💬
                </span>
                <span>Ask Query on WhatsApp</span>
              </button>

              {showAddedMessage && (
                <div className="text-center text-xs text-emerald-800 font-bold bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-200 animate-fadeIn">
                  ✓ Successfully added {quantity} item{quantity > 1 ? 's' : ''} to your shopping basket!
                </div>
              )}
            </div>

            {/* Inquiry Modal */}
            <ProductWhatsAppInquiryModal
              product={product}
              isOpen={isInquiryOpen}
              onClose={() => setIsInquiryOpen(false)}
            />

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#E8E1D7]">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C5838] block mb-1">
                You May Also Enjoy
              </span>
              <h2 className="font-serif text-3xl font-normal text-[#1C1917]">
                Pairs Wonderfully With
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group bg-white rounded-3xl border border-[#E8E1D7] overflow-hidden p-4 space-y-3 hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-[#EFE8DE]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="250px"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-[#1C1917] group-hover:text-[#1E382B] transition-colors">
                      {p.name}
                    </h3>
                    <div className="font-serif font-bold text-[#1E382B] mt-1">
                      ₹{p.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
