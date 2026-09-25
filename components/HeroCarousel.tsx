'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  titleItalic: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  badgeText?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'protein-nutrition',
    tag: 'CLEAN FITNESS NUTRITION',
    title: 'Your Favourite Treats,',
    titleItalic: 'Enriched With Clean Protein.',
    subtitle: '12g+ clean protein per piece with roasted California almonds, pure A2 desi cow ghee, and zero refined sugar.',
    buttonText: 'Shop High Protein',
    buttonLink: '/products?category=protein-nutrition',
    secondaryButtonText: 'Explore Collections',
    secondaryButtonLink: '/products',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85',
    badgeText: '12g Protein / Piece',
  },
  {
    id: 'dry-fruits-nuts',
    tag: 'HANDPICKED SUPERFOODS',
    title: 'Slow-Roasted Nuts,',
    titleItalic: 'All Flavour, Zero Excess Oil.',
    subtitle: 'Premium California almonds, whole cashews, and crunch-roasted seed mixes prepared fresh in small batches.',
    buttonText: 'Explore Roasted Nuts',
    buttonLink: '/products?category=healthy-snacks',
    secondaryButtonText: 'View All Snacks',
    secondaryButtonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&auto=format&fit=crop&q=85',
    badgeText: '100% Whole Nuts',
  },
  {
    id: 'mithai-ladoos',
    tag: 'HERITAGE RECIPES',
    title: 'Pure A2 Desi Ghee Ladoos,',
    titleItalic: 'The Warmth of Home Kitchen.',
    subtitle: 'Melt-in-mouth Besan and Motichoor ladoos slow-cooked in 100% pure desi cow ghee and organic jaggery.',
    buttonText: 'Shop Mithai & Ladoos',
    buttonLink: '/products?category=mithai',
    secondaryButtonText: 'Discover Flavours',
    secondaryButtonLink: '/products',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&auto=format&fit=crop&q=85',
    badgeText: 'Pure Cow Ghee',
  },
  {
    id: 'peanut-butter',
    tag: '100% NATURAL BUTTER',
    title: 'Stone-Ground Peanuts,',
    titleItalic: 'Zero Added Palm Oil & Preservatives.',
    subtitle: 'Slow stone-ground daily for an irresistibly rich texture and deep roasted aroma. Pure plant-based energy.',
    buttonText: 'Discover Butters',
    buttonLink: '/products?category=peanut-butter',
    secondaryButtonText: 'All Spreads',
    secondaryButtonLink: '/products',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1400&auto=format&fit=crop&q=85',
    badgeText: 'Stone-Ground Daily',
  },
  {
    id: 'nut-cake-cookies',
    tag: 'HEALTHY BAKERY CRAFT',
    title: 'Wholesome Nut Cakes,',
    titleItalic: 'Guilt-Free Cookies & Bakes.',
    subtitle: 'Nut-dense artisan cakes and crunchy whole grain cookies sweetened with forest honey and natural jaggery.',
    buttonText: 'Explore Healthy Treats',
    buttonLink: '/products?category=healthy-snacks',
    secondaryButtonText: 'Shop All Bakes',
    secondaryButtonLink: '/products',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&auto=format&fit=crop&q=85',
    badgeText: 'Zero Maida / No Preservatives',
  },
];

export interface HeroCarouselProps {
  initialSlides?: HeroSlide[];
}

export default function HeroCarousel({ initialSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides && initialSlides.length > 0 ? initialSlides : HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadSlides() {
      try {
        const res = await fetch('/api/content');
        const json = await res.json();
        if (json.success && json.data?.heroSlides && Array.isArray(json.data.heroSlides) && json.data.heroSlides.length > 0) {
          setSlides(json.data.heroSlides);
        }
      } catch (e) {
        console.error('Failed to load dynamic hero slides:', e);
      }
    }
    loadSlides();
  }, []);

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide, totalSlides]);

  if (totalSlides === 0) return null;

  const safeIndex = currentSlide >= totalSlides ? 0 : currentSlide;
  const slide = slides[safeIndex];

  return (
    <div className="relative w-full overflow-hidden bg-[#FAF7F2]">
      {/* Main Banner Slide Container */}
      <div className="relative w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[560px] flex items-center">
        
        {/* Slide Background Image with Smooth Crossfade */}
        {slides.map((s, idx) => (
          <div
            key={s.id || `slide-${idx}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={s.image}
              alt={s.title || 'Nutri Ghar Product Banner'}
              fill
              priority={idx === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* High-Contrast Gradient Overlay for Legibility (Vertical on mobile, horizontal on desktop) */}
            {/* High-Contrast Gradient Overlay for Crisp Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-20 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="max-w-2xl text-white space-y-2.5 sm:space-y-4 animate-fadeIn" key={safeIndex}>
            
            {/* Pill Tag & Mobile Badge */}
            <div className="flex flex-wrap items-center gap-2">
              {slide.tag && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#FDF0A6] text-[10px] sm:text-xs font-extrabold tracking-[0.18em] uppercase border border-white/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FDF0A6]" />
                  {slide.tag}
                </div>
              )}
              {slide.badgeText && (
                <div className="inline-flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E382B]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  <span className="w-1 h-1 rounded-full bg-[#E5B56A]" />
                  <span>{slide.badgeText}</span>
                </div>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-serif text-xl sm:text-4xl lg:text-5xl font-normal leading-snug sm:leading-tight tracking-tight text-white drop-shadow-sm">
              {slide.title} {slide.titleItalic && <br className="hidden sm:inline" />}{' '}
              {slide.titleItalic && (
                <span className="font-serif italic font-normal text-[#E5B56A]">
                  {slide.titleItalic}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="text-xs sm:text-sm lg:text-base text-stone-200 leading-relaxed max-w-lg font-light drop-shadow-xs line-clamp-2 sm:line-clamp-none">
                {slide.subtitle}
              </p>
            )}

            {/* Action Buttons (Clean & uncrowded on mobile) */}
            <div className="flex items-center gap-2.5 pt-1 sm:pt-2">
              {slide.buttonText && (
                <Link
                  href={slide.buttonLink || '/products'}
                  className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#4E652B] hover:bg-[#3D5021] text-white text-xs sm:text-sm font-bold tracking-wider uppercase text-center shadow-lg hover:shadow-xl transition-all duration-300 group inline-flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                >
                  <span>{slide.buttonText}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              )}
              
              {slide.secondaryButtonText && (
                <Link
                  href={slide.secondaryButtonLink || '/products'}
                  className="hidden sm:inline-flex px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/40 text-xs sm:text-sm font-bold tracking-wider uppercase text-center transition-all duration-300 cursor-pointer"
                >
                  {slide.secondaryButtonText}
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Floating Quality Badge (Desktop Only) */}
        {slide.badgeText && (
          <div className="hidden sm:flex absolute bottom-8 right-8 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#1E382B] shadow-xl border border-stone-200 items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4E652B]" />
            <span>{slide.badgeText}</span>
          </div>
        )}

      </div>

      {/* ========================================================
          Fresh Kitchen Batch Countdown Strip (Matching Reference Image 1)
      ======================================================== */}
      <div className="w-full bg-[#4E652B] text-white py-2.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#E7F0AB]">
            <span className="w-2 h-2 rounded-full bg-[#E5B56A] animate-pulse" />
            <span>Fresh Weekly Batch Cooking Now • Dispatches In:</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-black/25 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md">
              <div className="font-serif text-sm sm:text-base font-bold text-white leading-tight">2</div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300">Days</div>
            </div>
            <div className="bg-black/25 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md">
              <div className="font-serif text-sm sm:text-base font-bold text-white leading-tight">14</div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300">Hours</div>
            </div>
            <div className="bg-black/25 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md">
              <div className="font-serif text-sm sm:text-base font-bold text-white leading-tight">35</div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300">Mins</div>
            </div>
            <div className="bg-black/25 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md">
              <div className="font-serif text-sm sm:text-base font-bold text-[#E5B56A] leading-tight">20</div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          Interactive Slider Controls Bar (Matching Reference Image 3)
          [ < ]  [ ○ ] [ ○ ] [ ● ] [ ○ ] [ ○ ]  [ > ]   |   [ || ]
      ======================================================== */}
      <div className="w-full bg-white border-b border-stone-200 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Quick Product Tabs */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 overflow-x-auto py-1">
            {slides.map((s, idx) => (
              <button
                key={s.id || `tab-${idx}`}
                onClick={() => setCurrentSlide(idx)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  idx === safeIndex
                    ? 'bg-[#4E652B] text-white shadow-xs'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
              >
                {s.tag ? s.tag : `Slide ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* Centered Controls (<  o  o  •  o  o  >  ||) */}
          <div className="flex items-center gap-4 sm:gap-6 mx-auto md:mx-0">
            
            {/* Previous Arrow Button (<) */}
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous Slide"
              title="Previous Slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Slide Indicator Dots (○ ○ ● ○ ○) */}
            <div className="flex items-center gap-2.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === safeIndex
                      ? 'w-3 h-3 bg-stone-900 ring-2 ring-stone-400'
                      : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Arrow Button (>) */}
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next Slide"
              title="Next Slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <div className="h-4 w-[1px] bg-stone-300 mx-1" />

            {/* Pause / Play Button (|| / ▶) */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}
