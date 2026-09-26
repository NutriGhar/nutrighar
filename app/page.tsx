'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useContent } from '@/context/ContentContext';
import { Product } from '@/types/product';
import { DEFAULT_CURATED_COLLECTIONS, DEFAULT_PRODUCT_SPOTLIGHT, DEFAULT_TESTIMONIALS } from '@/types/content';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';

const DEFAULT_CONTENT = {
  brandStory: {
    eyebrow: 'THE NUTRI GHAR WAY',
    heading: 'Rooted in Tradition.',
    headingItalic: 'Made for Today.',
    paragraph1: 'At Nutri Ghar, we believe you shouldn’t have to choose between the pure, heartwarming flavors of Indian heritage and the clean nutritional standards demanded by modern living.',
    paragraph2: 'Every jar of stone-ground peanut butter and every handcrafted batch of ladoos begins with 100% whole ingredients: pure A2 desi cow ghee, California almonds, rich roasted gram flour, and wild forest honey.',
    paragraph3: 'No industrial shortcuts. Zero palm oil, no artificial flavorings, and no chemical preservatives. Just honest, wholesome nutrition prepared exactly the way it would be in your family home.',
    storyImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&auto=format&fit=crop&q=80',
    quote: '“Food made with the warmth of a mother’s kitchen nourishes not just the body, but the soul.”',
  },
  curatedCollections: DEFAULT_CURATED_COLLECTIONS,
  productSpotlight: DEFAULT_PRODUCT_SPOTLIGHT,
  testimonials: DEFAULT_TESTIMONIALS,
  newsletter: {
    heading: 'A Little Goodness in Your Inbox.',
    description: 'Receive thoughtful wellness notes, seasonal kitchen recipes, and priority access to fresh batches.',
    promoNote: 'We respect your privacy. No spam, ever. Unsubscribe anytime.',
  },
};

export default function HomePage() {
  const { addItem } = useCart();
  const { content: globalContent } = useContent();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [content, setContent] = useState<any>(DEFAULT_CONTENT);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (globalContent) {
      setContent((prev: any) => ({
        ...prev,
        ...globalContent,
        brandStory: {
          ...prev.brandStory,
          ...(globalContent.brandStory || {}),
        },
        curatedCollections: globalContent.curatedCollections || prev.curatedCollections || DEFAULT_CURATED_COLLECTIONS,
        productSpotlight: globalContent.productSpotlight || prev.productSpotlight || DEFAULT_PRODUCT_SPOTLIGHT,
        testimonials: globalContent.testimonials || prev.testimonials || DEFAULT_TESTIMONIALS,
        newsletter: {
          ...prev.newsletter,
          ...(globalContent.newsletter || {}),
        },
      }));
    }
  }, [globalContent]);

  useEffect(() => {
    async function loadDynamicStorefrontData() {
      try {
        const prodRes = await fetch(`/api/products?active=true&t=${Date.now()}`, { cache: 'no-store' });
        const prodData = await prodRes.json();

        if (prodData.success && prodData.data?.length > 0) {
          setProducts(
            prodData.data.map((p: any) => ({
              ...p,
              category: p.categorySlug || p.category,
              reviews: p.reviewCount || p.reviews || 0,
              featured: p.isFeatured !== undefined ? p.isFeatured : p.featured,
            }))
          );
        }
      } catch (err) {
        console.error('Storefront dynamic fetch error:', err);
      }
    }

    loadDynamicStorefrontData();
  }, []);

  const featuredProducts =
    products.filter((p) => p.isFeatured || p.featured).length > 0
      ? products.filter((p) => p.isFeatured || p.featured).slice(0, 8)
      : products.slice(0, 8);
  const heroBestseller =
    products.find((p) => p.isBestSeller || p.id === 'protein-ladoo' || p.slug === 'protein-ladoo' || p.id === 'dry-fruit-ladoo') ||
    products[0] ||
    INITIAL_PRODUCTS[0];

  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity === 0) return;
    addItem(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2400);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      setNewsletterSubmitting(true);
      setNewsletterMessage(null);
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterMessage({ text: data.message || '✓ Thank you for subscribing to Nutri Ghar!' });
        setNewsletterEmail('');
      } else {
        setNewsletterMessage({ text: data.error || 'Failed to subscribe. Please try again.', isError: true });
      }
    } catch {
      setNewsletterMessage({ text: '✓ Thank you for joining Nutri Ghar wellness notes!' });
      setNewsletterEmail('');
    } finally {
      setNewsletterSubmitting(false);
      setTimeout(() => setNewsletterMessage(null), 6000);
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] overflow-x-hidden selection:bg-[#EAE0D2] selection:text-[#1E382B]">
      
      {/* ========================================================
          1. HERO CAROUSEL (Interactive Movable Slider Bar)
      ======================================================== */}
      <HeroCarousel />


      {/* ========================================================
          2. TRUST STRIP (Clean, Spacious & Minimal)
      ======================================================== */}
      <section className="border-y border-[#E8E1D7] bg-[#F6F1EA] py-5 sm:py-8">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
            
            <div className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#4E652B] shrink-0 shadow-2xs">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif text-xs sm:text-base font-semibold text-[#1C1917]">Freshly Made</h4>
                <p className="text-[10px] sm:text-xs text-[#6B635B] font-light">Small weekly batches</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#4E652B] shrink-0 shadow-2xs">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif text-xs sm:text-base font-semibold text-[#1C1917]">Pure A2 Desi Ghee</h4>
                <p className="text-[10px] sm:text-xs text-[#6B635B] font-light">Zero palm oil or maida</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#4E652B] shrink-0 shadow-2xs">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif text-xs sm:text-base font-semibold text-[#1C1917]">Homemade Care</h4>
                <p className="text-[10px] sm:text-xs text-[#6B635B] font-light">Slow-cooked recipes</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#4E652B] shrink-0 shadow-2xs">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 0H7.5A2.25 2.25 0 005.25 6v7.5" />
                </svg>
              </div>
              <div>
                <h4 className="font-serif text-xs sm:text-base font-semibold text-[#1C1917]">Safe Doorstep Transit</h4>
                <p className="text-[10px] sm:text-xs text-[#6B635B] font-light">Sealed fresh packaging</p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          3. CATEGORY SHOWCASE GRID (4 Clean Visual Category Cards)
      ======================================================== */}
      <section id="collections" className="py-10 sm:py-20 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-12 gap-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9C5838] block mb-1">
              {content?.curatedCollections?.eyebrow || 'Curated Collections'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#1C1917] tracking-tight">
              {content?.curatedCollections?.heading || 'Pure Food For Everyday Living'}
            </h2>
          </div>
          <p className="text-xs sm:text-base text-[#6B635B] max-w-md font-light">
            {content?.curatedCollections?.description || 'From handcrafted ghee mithais to stone-ground peanut butters, explore wholesome nutrition crafted for your family.'}
          </p>
        </div>

        {/* Dynamic 4 Category Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {(content?.curatedCollections?.cards || DEFAULT_CURATED_COLLECTIONS.cards).map((card: any) => (
            <Link
              key={card.id || card.title}
              href={`/products?category=${encodeURIComponent(card.categorySlug || 'all')}`}
              className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200 hover:border-[#4E652B]/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-36 sm:h-64 w-full bg-[#EBE2D5] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {card.tag && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-xs text-[#9C5838] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs">
                    {card.tag}
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-serif text-sm sm:text-xl font-normal text-[#1C1917] group-hover:text-[#4E652B] transition-colors mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6B635B] font-light leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>
                <div className="pt-2 sm:pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#4E652B] group-hover:text-[#3D5021]">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ========================================================
          4. BESTSELLERS PRODUCT GRID ("Made for Everyday Goodness")
      ======================================================== */}
      <section id="bestsellers" className="py-10 sm:py-20 bg-[#F4EFEA] border-y border-[#E8E1D7]">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-12 gap-3">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9C5838] block mb-1">
                Fresh From The Kitchen
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#1C1917] tracking-tight">
                Made for Everyday Goodness
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4E652B] hover:text-[#3D5021] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All Products</span>
              <span>→</span>
            </Link>
          </div>

          {/* Product Cards Grid: 2 columns on Mobile, 3 on Tablet, 4 on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================
          5. BRAND STORY & CRAFT (Artisanal Kitchen Split)
      ======================================================== */}
      <section id="story" className="py-20 lg:py-28 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Lifestyle Kitchen Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[420px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-[#EBE2D5] border border-stone-200">
              <Image
                src={content.brandStory.storyImage}
                alt="Homemade kitchen preparation and authentic Indian cooking craft"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-5 sm:p-6 rounded-2xl bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E8E1D7]">
                <p className="font-serif text-base sm:text-lg text-[#1C1917] italic leading-snug">
                  {content.brandStory.quote}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-[#9C5838] font-bold mt-2">
                  The Nutri Ghar Philosophy
                </p>
              </div>
            </div>
          </div>

          {/* Right: Narrative Story */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE8DE] text-[#9C5838] text-xs font-bold tracking-[0.2em] uppercase">
              {content.brandStory.eyebrow}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal leading-tight tracking-tight">
              {content.brandStory.heading} <br />
              <span className="italic font-serif text-[#1E382B]">{content.brandStory.headingItalic}</span>
            </h2>

            <div className="space-y-4 text-[#6B635B] text-sm sm:text-base font-light leading-relaxed">
              <p>{content.brandStory.paragraph1}</p>
              <p>{content.brandStory.paragraph2}</p>
              <p>{content.brandStory.paragraph3}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                href="/about"
                className="px-8 py-3.5 rounded-full bg-[#1E382B] hover:bg-[#2A4F3C] text-[#FAF7F2] text-xs sm:text-sm font-bold tracking-wider uppercase inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Discover Our Story</span>
                <span>→</span>
              </Link>
              
              <div className="flex items-center gap-2 text-xs text-[#1C1917] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4E652B]" />
                Small-Batch Artisanal Production
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================
          6. WHY CHOOSE NUTRI GHAR (Brand Manifesto & Visual Showcase)
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-[#F4EFEA] border-y border-[#E8E1D7]">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Infographic Visual Showcase */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white group hover:scale-[1.01] transition-transform">
                <div className="relative w-full aspect-square">
                  <Image
                    src="/images/nutrighar-infographic.png"
                    alt="Nutri Ghar Brand Values & Purity Checklist"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>

            {/* Purity Highlights */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE8DE] text-[#4E652B] text-xs font-bold tracking-[0.2em] uppercase">
                Zero Compromise Standard
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1C1917] leading-tight">
                Made at Home. <br />
                <span className="italic font-serif text-[#1E382B]">Made with Purpose.</span>
              </h2>

              <p className="text-[#6B635B] text-sm sm:text-base font-light leading-relaxed">
                Nutri Ghar brings you wholesome, nutritious, and authentic products made with the goodness of nature. Real ingredients, real taste, real care.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xl block mb-1">🚫</span>
                  <strong className="text-sm text-stone-900 block font-bold">No Palm Oil &amp; Maida</strong>
                  <span className="text-xs text-stone-500 font-light">100% whole grain purity</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xl block mb-1">🍯</span>
                  <strong className="text-sm text-stone-900 block font-bold">No White Sugar</strong>
                  <span className="text-xs text-stone-500 font-light">Jaggery &amp; honey only</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xl block mb-1">🥜</span>
                  <strong className="text-sm text-stone-900 block font-bold">Stone-Ground Daily</strong>
                  <span className="text-xs text-stone-500 font-light">Pure roasted peanuts</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-xl block mb-1">✨</span>
                  <strong className="text-sm text-stone-900 block font-bold">Fresh On Order</strong>
                  <span className="text-xs text-stone-500 font-light">Small batch craft</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  <span>Read Full Brand Manifesto</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          7. SIGNATURE SPOTLIGHT (Protein Power Ladoo Feature)
      ======================================================== */}
      <section className="py-16 sm:py-24 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8E1D7] p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Product Feature Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-[#EBE2D5] border border-stone-200">
                <Image
                  src={content?.productSpotlight?.image || DEFAULT_PRODUCT_SPOTLIGHT.image}
                  alt={content?.productSpotlight?.heading || 'Protein Power Ladoo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 bg-[#9C5838] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  {content?.productSpotlight?.tag || 'Signature Feature'}
                </div>
              </div>
            </div>

            {/* Right: Detailed Story & Macros */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9C5838] block mb-1.5">
                  {content?.productSpotlight?.eyebrow || 'PRODUCT SPOTLIGHT'}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] leading-tight">
                  {content?.productSpotlight?.heading || 'Protein Power Ladoo'}
                </h2>
                <p className="font-serif italic text-lg text-[#1E382B] mt-1">
                  {content?.productSpotlight?.headingItalic || 'Traditional Taste. Modern Nutrition.'}
                </p>
              </div>

              <p className="text-[#6B635B] text-sm sm:text-base font-light leading-relaxed">
                {content?.productSpotlight?.description || 'Reimagining India\'s timeless post-meal sweet as an everyday functional superfood. Handcrafted with clean protein, stone-ground oats, roasted California almonds, and 100% pure desi cow ghee.'}
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-[#E8E1D7]">
                <div>
                  <span className="font-serif text-2xl font-bold text-[#1E382B]">
                    {content?.productSpotlight?.protein || '12g'}
                  </span>
                  <span className="text-xs text-[#6B635B] block font-light">Clean Protein</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-[#1E382B]">
                    {content?.productSpotlight?.sugar || '0g'}
                  </span>
                  <span className="text-xs text-[#6B635B] block font-light">Refined Sugar</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-[#1E382B]">
                    {content?.productSpotlight?.ghee || '100%'}
                  </span>
                  <span className="text-xs text-[#6B635B] block font-light">Pure Desi Ghee</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-[#1E382B]">
                    {content?.productSpotlight?.freshness || 'Weekly'}
                  </span>
                  <span className="text-xs text-[#6B635B] block font-light">Batches</span>
                </div>
              </div>

              {/* Purchase CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <span className="text-xs text-[#6B635B] block font-light">
                    {content?.productSpotlight?.priceNote || 'Price per 400g Box'}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E382B]">
                    ₹{content?.productSpotlight?.price || 349}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const spotlightProd = products.find(p => p.id === 'dry-fruit-ladoo' || p.slug === 'dry-fruit-ladoo' || p.id === 'protein-ladoo') || heroBestseller;
                    handleAddToCart({
                      ...spotlightProd,
                      price: content?.productSpotlight?.price || spotlightProd.price,
                      name: content?.productSpotlight?.heading || spotlightProd.name,
                      image: content?.productSpotlight?.image || spotlightProd.image,
                    });
                  }}
                  className={`px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer ${
                    addedProductId === (heroBestseller.id || 'dry-fruit-ladoo')
                      ? 'bg-[#2A4F3C] text-white'
                      : 'bg-[#4E652B] hover:bg-[#3D5021] text-white'
                  }`}
                >
                  {addedProductId === (heroBestseller.id || 'dry-fruit-ladoo') ? '✓ Added To Cart' : (content?.productSpotlight?.buttonText ? `${content.productSpotlight.buttonText} — ₹${content?.productSpotlight?.price || 349}` : `Add to Cart — ₹${content?.productSpotlight?.price || 349}`)}
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          8. CUSTOMER LOVE & TESTIMONIALS (Clean Centered Layout)
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-[#F6F1EA] border-y border-[#E8E1D7]">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9C5838] block mb-2">
              {content?.testimonials?.eyebrow || 'VERIFIED EXPERIENCES'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              {content?.testimonials?.heading || 'Loved Across Indian Homes'}
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {(content?.testimonials?.items || DEFAULT_TESTIMONIALS.items).map((item: any) => (
              <div
                key={item.id || item.name}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-500 text-xs">
                    {'★'.repeat(item.rating || 5)}
                  </div>
                  <p className="font-serif text-sm sm:text-base text-[#1C1917] leading-relaxed italic font-normal">
                    “{item.review}”
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100">
                  <div className="font-bold text-xs text-[#1C1917]">{item.name}</div>
                  <div className="text-[11px] text-[#6B635B] font-light mt-0.5">
                    {item.location ? `${item.location} • ` : ''}{item.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================
          9. STAY CONNECTED / NEWSLETTER (Clean Centered Banner)
      ======================================================== */}
      <section className="py-20 lg:py-24 bg-[#EFE8DE] border-t border-[#E8E1D7]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9C5838] block">
            STAY CONNECTED
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight leading-tight">
            {content.newsletter.heading}
          </h2>

          <p className="text-[#6B635B] text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
            {content.newsletter.description}
          </p>

          <div className="pt-2 w-full max-w-md mx-auto">
            <form onSubmit={handleNewsletterSubmit} className="space-y-3 flex flex-col items-center">
              <div className="w-full flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-full border border-stone-300 shadow-sm focus-within:border-[#1E382B] transition-all">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={newsletterSubmitting}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none text-center sm:text-left"
                />
                <button
                  type="submit"
                  disabled={newsletterSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1E382B] text-white hover:bg-[#2A4F3C] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              {newsletterMessage && (
                <p className={`text-xs font-bold py-2 px-4 rounded-xl border text-center animate-fadeIn ${
                  newsletterMessage.isError
                    ? 'text-rose-800 bg-rose-50 border-rose-200'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                }`}>
                  {newsletterMessage.text}
                </p>
              )}

              <p className="text-[11px] text-stone-500 font-light text-center">
                {content.newsletter.promoNote}
              </p>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
