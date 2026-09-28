'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useContent } from '@/context/ContentContext';

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
    title: 'Your Favourite Treats, Enriched With Clean Protein',
    titleItalic: 'Clean Protein Nutrition',
    subtitle: '12g+ clean protein per piece with roasted California almonds, pure A2 desi cow ghee, and zero refined sugar.',
    buttonText: 'Shop High Protein',
    buttonLink: '/products?category=protein-nutrition',
    image: '/images/clean-protein-pouch-banner.jpg',
    badgeText: '12g Protein / Piece',
  },
  {
    id: 'peanut-butter',
    tag: '100% NATURAL BUTTER',
    title: 'Stone-Ground Peanuts, Zero Palm Oil',
    titleItalic: 'Pure Nut Butter',
    subtitle: 'Slow stone-ground daily for an irresistibly rich texture and deep roasted aroma.',
    buttonText: 'Discover Butters',
    buttonLink: '/products?category=peanut-butter',
    image: '/images/peanut-butter-banner.jpg',
    badgeText: 'Stone-Ground Daily',
  },
  {
    id: 'mithai-ladoos',
    tag: 'HERITAGE RECIPES',
    title: 'Pure A2 Desi Ghee Ladoos',
    titleItalic: 'Warmth of Home',
    subtitle: 'Melt-in-mouth Besan and Dry fruit ladoos slow-cooked in 100% pure desi cow ghee.',
    buttonText: 'Shop Mithai & Ladoos',
    buttonLink: '/products?category=mithai',
    image: '/images/dry-fruit-ladoos-banner.jpg',
    badgeText: 'Pure Cow Ghee',
  },
  {
    id: 'dry-fruits-nuts',
    tag: 'HANDPICKED SUPERFOODS',
    title: 'Slow-Roasted Nuts, All Flavour Zero Excess Oil',
    titleItalic: 'Artisanal Superfoods',
    subtitle: 'Premium California almonds, whole cashews, and crunch-roasted seed mixes.',
    buttonText: 'Explore Roasted Nuts',
    buttonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&auto=format&fit=crop&q=85',
    badgeText: '100% Whole Nuts',
  },
  {
    id: 'nut-cake-cookies',
    tag: 'HEALTHY BAKERY CRAFT',
    title: 'Wholesome Nut Cakes & Guilt-Free Cookies',
    titleItalic: 'Zero Maida',
    subtitle: 'Nut-dense artisan cakes and crunchy whole grain cookies sweetened with forest honey.',
    buttonText: 'Explore Healthy Treats',
    buttonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&auto=format&fit=crop&q=85',
    badgeText: 'Zero Maida / No Preservatives',
  },
];

export interface HeroCarouselProps {
  initialSlides?: HeroSlide[];
}

export default function HeroCarousel({ initialSlides }: HeroCarouselProps) {
  const { content } = useContent();
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : HERO_SLIDES
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (content?.heroSlides && Array.isArray(content.heroSlides) && content.heroSlides.length > 0) {
      setSlides(content.heroSlides);
    }
  }, [content]);

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-play timer (5 seconds)
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

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (totalSlides === 0) return null;

  const safeIndex = currentSlide >= totalSlides ? 0 : currentSlide;
  const slide = slides[safeIndex];

  return (
    <section className="relative w-full bg-[#FAF7F2] select-none">
      
      {/* 100% Full-Brightness Crystal Clear Clickable Banner */}
      <div
        className="relative w-full aspect-[4/3.8] sm:aspect-[16/7] lg:aspect-[21/8] min-h-[300px] sm:min-h-[420px] overflow-hidden cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={slide.buttonLink || '/products'}
          className="block relative w-full h-full"
          aria-label={slide.title || 'View Collection'}
        >
          {slides.map((s, idx) => (
            <div
              key={s.id || `slide-${idx}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* 100% Full natural resolution image with ZERO black gradient and ZERO dark overlay */}
              <Image
                src={s.image}
                alt={s.title || 'Nutri Ghar Product Banner'}
                fill
                priority={idx === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
        </Link>

        {/* Desktop Left & Right Arrow Buttons */}
        <div className="hidden sm:flex absolute inset-y-0 left-0 right-0 items-center justify-between px-4 z-20 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all cursor-pointer pointer-events-auto hover:scale-105"
            aria-label="Previous Slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all cursor-pointer pointer-events-auto hover:scale-105"
            aria-label="Next Slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Clean Minimal Slider Dots Below Banner */}
      <div className="w-full bg-[#FAF7F2] py-2.5 sm:py-3 flex items-center justify-center gap-2 border-b border-stone-200/80">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer p-0 m-0 border-0 shrink-0 focus:outline-none ${
              idx === safeIndex
                ? 'w-5 h-2 bg-[#1E382B]'
                : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
            }`}
            style={{ height: '8px', minHeight: 'unset', maxHeight: '8px' }}
            aria-label={`Go to slide ${idx + 1}`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
