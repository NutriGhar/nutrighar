'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  WebsiteContent,
  HeroSlideContent,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CURATED_COLLECTIONS,
  DEFAULT_PRODUCT_SPOTLIGHT,
  DEFAULT_TESTIMONIALS,
  CollectionCard,
  TestimonialItem,
  CuratedCollectionsContent,
  ProductSpotlightContent,
  TestimonialsContent,
} from '@/types/content';

export default function AdminContentPage() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<keyof WebsiteContent>('heroSlides');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      let localSaved: WebsiteContent | null = null;
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('nutrighar_custom_content');
          if (stored) {
            localSaved = JSON.parse(stored);
            setContent(localSaved);
          }
        }
      } catch {
        // ignore parse error
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          const loaded = data.data;
          const merged: WebsiteContent = {
            ...loaded,
            heroSlides: (loaded.heroSlides && Array.isArray(loaded.heroSlides) && loaded.heroSlides.length > 0)
              ? loaded.heroSlides
              : DEFAULT_HERO_SLIDES,
            curatedCollections: {
              ...DEFAULT_CURATED_COLLECTIONS,
              ...(loaded.curatedCollections || {}),
              cards: (loaded.curatedCollections?.cards && Array.isArray(loaded.curatedCollections.cards) && loaded.curatedCollections.cards.length > 0)
                ? loaded.curatedCollections.cards
                : DEFAULT_CURATED_COLLECTIONS.cards,
            },
            productSpotlight: {
              ...DEFAULT_PRODUCT_SPOTLIGHT,
              ...(loaded.productSpotlight || {}),
            },
            testimonials: {
              ...DEFAULT_TESTIMONIALS,
              ...(loaded.testimonials || {}),
              items: (loaded.testimonials?.items && Array.isArray(loaded.testimonials.items) && loaded.testimonials.items.length > 0)
                ? loaded.testimonials.items
                : DEFAULT_TESTIMONIALS.items,
            },
          };
          if (localSaved) {
            setContent({
              ...merged,
              ...localSaved,
              curatedCollections: {
                ...DEFAULT_CURATED_COLLECTIONS,
                ...(merged.curatedCollections || {}),
                ...(localSaved.curatedCollections || {}),
                cards: localSaved.curatedCollections?.cards || merged.curatedCollections?.cards || DEFAULT_CURATED_COLLECTIONS.cards,
              },
              productSpotlight: {
                ...DEFAULT_PRODUCT_SPOTLIGHT,
                ...(merged.productSpotlight || {}),
                ...(localSaved.productSpotlight || {}),
              },
              testimonials: {
                ...DEFAULT_TESTIMONIALS,
                ...(merged.testimonials || {}),
                ...(localSaved.testimonials || {}),
                items: localSaved.testimonials?.items || merged.testimonials?.items || DEFAULT_TESTIMONIALS.items,
              },
            });
          } else {
            setContent(merged);
          }
        }
      } catch (err: any) {
        if (!localSaved) {
          setError(err.message || 'Failed to load content');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSection = async (sectionKey: keyof WebsiteContent) => {
    if (!content) return;
    try {
      setIsSaving(true);
      setError(null);

      // Save to localStorage immediately so it never reverts on refresh
      const updatedContent = { ...content };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutrighar_custom_content', JSON.stringify(updatedContent));
        window.dispatchEvent(new CustomEvent('nutrighar_content_updated', { detail: updatedContent }));
      }

      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionKey,
          data: content[sectionKey],
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const merged = { ...data.data, ...updatedContent };
        setContent(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nutrighar_custom_content', JSON.stringify(merged));
        }
        showToast(`Saved "${String(sectionKey)}" changes to live storefront!`);
      } else {
        showToast(`Saved "${String(sectionKey)}" changes locally!`);
      }
    } catch (err: any) {
      showToast(`Saved "${String(sectionKey)}" changes locally!`);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // HERO SLIDES HELPER FUNCTIONS
  // -------------------------------------------------------------
  const currentSlides = content?.heroSlides && Array.isArray(content.heroSlides) ? content.heroSlides : DEFAULT_HERO_SLIDES;
  const activeSlide = currentSlides[selectedSlideIndex] || currentSlides[0];

  const updateActiveSlide = (fields: Partial<HeroSlideContent>) => {
    if (!content) return;
    const updated = [...currentSlides];
    const targetIdx = selectedSlideIndex >= updated.length ? 0 : selectedSlideIndex;
    updated[targetIdx] = { ...updated[targetIdx], ...fields };
    setContent({ ...content, heroSlides: updated });
  };

  // -------------------------------------------------------------
  // PRODUCT SPOTLIGHT HELPER FUNCTIONS
  // -------------------------------------------------------------
  const spotlight = {
    ...DEFAULT_PRODUCT_SPOTLIGHT,
    ...(content?.productSpotlight || {}),
  };

  const updateProductSpotlight = (fields: Partial<ProductSpotlightContent>) => {
    if (!content) return;
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        productSpotlight: {
          ...DEFAULT_PRODUCT_SPOTLIGHT,
          ...(prev.productSpotlight || {}),
          ...fields,
        },
      };
    });
  };

  // -------------------------------------------------------------
  // CURATED COLLECTIONS HELPER FUNCTIONS
  // -------------------------------------------------------------
  const curatedCollections = {
    ...DEFAULT_CURATED_COLLECTIONS,
    ...(content?.curatedCollections || {}),
    cards: (content?.curatedCollections?.cards && Array.isArray(content.curatedCollections.cards) && content.curatedCollections.cards.length > 0)
      ? content.curatedCollections.cards
      : DEFAULT_CURATED_COLLECTIONS.cards,
  };

  const updateCuratedCollections = (fields: Partial<CuratedCollectionsContent>) => {
    if (!content) return;
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        curatedCollections: {
          ...DEFAULT_CURATED_COLLECTIONS,
          ...(prev.curatedCollections || {}),
          ...fields,
        },
      };
    });
  };

  const updateCollectionCard = (index: number, cardFields: Partial<CollectionCard>) => {
    const cards = [...curatedCollections.cards];
    cards[index] = { ...cards[index], ...cardFields };
    updateCuratedCollections({ cards });
  };

  // -------------------------------------------------------------
  // TESTIMONIALS HELPER FUNCTIONS
  // -------------------------------------------------------------
  const testimonials = {
    ...DEFAULT_TESTIMONIALS,
    ...(content?.testimonials || {}),
    items: (content?.testimonials?.items && Array.isArray(content.testimonials.items) && content.testimonials.items.length > 0)
      ? content.testimonials.items
      : DEFAULT_TESTIMONIALS.items,
  };

  const updateTestimonials = (fields: Partial<TestimonialsContent>) => {
    if (!content) return;
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: {
          ...DEFAULT_TESTIMONIALS,
          ...(prev.testimonials || {}),
          ...fields,
        },
      };
    });
  };

  const updateTestimonialItem = (index: number, itemFields: Partial<TestimonialItem>) => {
    const items = [...testimonials.items];
    items[index] = { ...items[index], ...itemFields };
    updateTestimonials({ items });
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      updateActiveSlide({ image: base64Url });
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `slide-${selectedSlideIndex}-${Date.now()}`,
            type: file.type,
            base64OrUrl: base64Url,
          }),
        });
        const uploadData = await res.json();
        if (uploadData.success && uploadData.url) {
          updateActiveSlide({ image: uploadData.url });
        }
      } catch {
        // Keep base64
      } finally {
        setIsUploadingImage(false);
        showToast('Image uploaded and set for this slide!');
      }
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSlide = () => {
    if (!content) return;
    const newSlide: HeroSlideContent = {
      id: `custom-slide-${Date.now()}`,
      tag: 'NEW COLLECTION',
      title: 'Freshly Handcrafted Treats,',
      titleItalic: 'Pure Nutrition From Home.',
      subtitle: 'Prepared fresh in small batches using premium whole ingredients and authentic recipes.',
      buttonText: 'Shop Collection',
      buttonLink: '/products',
      secondaryButtonText: 'Explore All',
      secondaryButtonLink: '/products',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85',
      badgeText: '100% Wholesome',
    };
    const updated = [...currentSlides, newSlide];
    setContent({ ...content, heroSlides: updated });
    setSelectedSlideIndex(updated.length - 1);
    showToast('Added a new slide template!');
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (!content) return;
    if (currentSlides.length <= 1) {
      setError('You must have at least 1 hero banner slide.');
      return;
    }
    const updated = currentSlides.filter((_, idx) => idx !== indexToDelete);
    setContent({ ...content, heroSlides: updated });
    setSelectedSlideIndex(Math.max(0, indexToDelete - 1));
    showToast('Slide removed.');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!content) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentSlides.length) return;

    const updated = [...currentSlides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setContent({ ...content, heroSlides: updated });
    setSelectedSlideIndex(targetIdx);
  };

  const handleResetSlidesToDefault = () => {
    if (!content) return;
    if (confirm('Reset all hero banner slides to Nutri Ghar original defaults? Any custom slide edits will be overwritten.')) {
      setContent({ ...content, heroSlides: DEFAULT_HERO_SLIDES });
      setSelectedSlideIndex(0);
      showToast('Reset hero banner slides to defaults.');
    }
  };

  if (isLoading || !content) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-xs uppercase tracking-widest text-[#6B635B] font-semibold">
        Loading website content editor...
      </div>
    );
  }

  const tabs: Array<{ id: keyof WebsiteContent; label: string; icon: string }> = [
    { id: 'heroSlides', label: 'Hero Carousel Slides', icon: '🎠' },
    { id: 'curatedCollections', label: 'Curated Collections', icon: '🛍️' },
    { id: 'productSpotlight', label: 'Product Spotlight (Protein Ladoo)', icon: '✨' },
    { id: 'testimonials', label: 'Loved Across India (Testimonials)', icon: '💬' },
    { id: 'announcement', label: 'Announcement Bar', icon: '📢' },
    { id: 'brandStory', label: 'Brand Story & Philosophy', icon: '📖' },
    { id: 'contact', label: 'Contact & Support', icon: '📞' },
    { id: 'footer', label: 'Footer & Socials', icon: '⚓' },
    { id: 'newsletter', label: 'Newsletter', icon: '💌' },
    { id: 'hero', label: 'Single Hero (Legacy)', icon: '🌟' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E382B] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-fadeIn">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9C5838] font-bold block mb-1">
            Storefront CMS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Website Content Editor
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Edit carousel banner slides, product photos, announcements, and brand narratives in real-time.
          </p>
        </div>

        <button
          onClick={() => handleSaveSection(activeTab)}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          {isSaving ? 'Saving Updates...' : '💾 Publish Live Content'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8E1D7]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E382B] text-[#1E382B] bg-white rounded-t-xl shadow-xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Form Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
        
        {/* ================= HERO CAROUSEL SLIDES ================= */}
        {activeTab === 'heroSlides' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Hero Carousel & Product Banners
                </h2>
                <p className="text-xs text-[#6B635B] font-light mt-0.5">
                  Upload your own product images and customize headline text, tags, badges, and button links for each banner slide.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3.5 py-2 rounded-xl bg-[#4E652B] hover:bg-[#3D5021] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+</span>
                  <span>Add Slide</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSlidesToDefault}
                  className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  title="Reset to Nutri Ghar original slides"
                >
                  ↺ Reset Defaults
                </button>
              </div>
            </div>

            {/* Slide Selector Carousel Tabs */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Select Slide to Edit ({currentSlides.length} Total Slides)
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {currentSlides.map((slideItem, idx) => {
                  const isSelected = idx === selectedSlideIndex;
                  return (
                    <button
                      key={slideItem.id || `slide-btn-${idx}`}
                      type="button"
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'border-[#1E382B] bg-[#FAF7F2] ring-2 ring-[#1E382B]/20 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-400'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-stone-100 relative shrink-0 border border-stone-200">
                        <Image
                          src={slideItem.image}
                          alt={slideItem.title}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9C5838]">
                          Slide #{idx + 1}
                        </div>
                        <div className="text-xs font-bold text-stone-900 max-w-[150px] truncate">
                          {slideItem.title || 'Untitled Slide'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Slide Editor */}
            {activeSlide && (
              <div className="bg-[#FAF7F2] p-5 sm:p-7 rounded-2xl border border-[#E8E1D7] space-y-6">
                
                {/* Slide Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E1D7] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1E382B] text-white text-xs font-bold uppercase tracking-wider">
                      Editing Slide #{selectedSlideIndex + 1}
                    </span>
                    <span className="text-xs text-stone-500 font-medium truncate max-w-[200px]">
                      {activeSlide.tag || 'Slide Settings'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(selectedSlideIndex, 'up')}
                      disabled={selectedSlideIndex === 0}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
                      title="Move slide left"
                    >
                      ← Move Left
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(selectedSlideIndex, 'down')}
                      disabled={selectedSlideIndex === currentSlides.length - 1}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
                      title="Move slide right"
                    >
                      Move Right →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(selectedSlideIndex)}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                      title="Delete this slide"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Live Banner Mockup Preview */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                    Live Banner Preview (Slide #{selectedSlideIndex + 1})
                  </span>
                  <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-inner border border-stone-300 bg-black flex items-center p-6 sm:p-8">
                    <Image
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      fill
                      className="object-cover"
                      sizes="800px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
                    
                    <div className="relative z-10 max-w-lg text-white space-y-2">
                      {activeSlide.tag && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#FDF0A6] text-[10px] font-extrabold tracking-widest uppercase border border-white/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FDF0A6]" />
                          {activeSlide.tag}
                        </div>
                      )}
                      <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight text-white drop-shadow-xs">
                        {activeSlide.title}{' '}
                        <span className="italic text-[#E5B56A]">{activeSlide.titleItalic}</span>
                      </h3>
                      <p className="text-xs text-stone-200 line-clamp-2 font-light">
                        {activeSlide.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-4 py-1.5 rounded-full bg-[#4E652B] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {activeSlide.buttonText || 'Shop'} →
                        </span>
                        {activeSlide.secondaryButtonText && (
                          <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
                            {activeSlide.secondaryButtonText}
                          </span>
                        )}
                      </div>
                    </div>

                    {activeSlide.badgeText && (
                      <div className="hidden sm:flex absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#1E382B] shadow-lg border border-stone-200 items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4E652B]" />
                        <span>{activeSlide.badgeText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload / Photo Settings */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E1D7] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                        Slide Image / Product Photo
                      </span>
                      <span className="text-[11px] text-stone-500 font-light">
                        Upload your high-resolution product photography (recommended 1400×600 or larger) or provide a photo URL.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* File Upload Dropzone */}
                    <div className="border-2 border-dashed border-[#D8CEBE] hover:border-[#1E382B] rounded-2xl p-4 text-center bg-[#FAF7F2] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        id={`slide-file-${selectedSlideIndex}`}
                        onChange={handleSlideImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor={`slide-file-${selectedSlideIndex}`}
                        className="flex flex-col items-center justify-center cursor-pointer space-y-1.5"
                      >
                        <span className="text-2xl">📸</span>
                        <span className="text-xs font-bold text-[#1E382B] hover:underline">
                          {isUploadingImage ? 'Uploading Image...' : 'Click to Upload Product Image'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-light">
                          Supports JPG, PNG, WebP (from your computer/phone)
                        </span>
                      </label>
                    </div>

                    {/* Image URL fallback */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Or Paste Image Web URL
                      </label>
                      <input
                        type="url"
                        value={activeSlide.image}
                        onChange={(e) => updateActiveSlide({ image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Copy & Badges Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#E8E1D7]">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Category Tag / Eyebrow Pill
                    </label>
                    <input
                      type="text"
                      value={activeSlide.tag}
                      onChange={(e) => updateActiveSlide({ tag: e.target.value })}
                      placeholder="e.g., CLEAN FITNESS NUTRITION"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Floating Quality Badge
                    </label>
                    <input
                      type="text"
                      value={activeSlide.badgeText || ''}
                      onChange={(e) => updateActiveSlide({ badgeText: e.target.value })}
                      placeholder="e.g., 12g Protein / Piece"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Main Headline (Line 1)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(e) => updateActiveSlide({ title: e.target.value })}
                      placeholder="e.g., Your Favourite Treats,"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Italic Accent Headline (Line 2)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.titleItalic}
                      onChange={(e) => updateActiveSlide({ titleItalic: e.target.value })}
                      placeholder="e.g., Enriched With Clean Protein."
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Slide Subtitle / Description
                    </label>
                    <textarea
                      value={activeSlide.subtitle}
                      onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                      rows={2}
                      placeholder="Describe the freshness, ingredients, and craft..."
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={activeSlide.buttonText}
                      onChange={(e) => updateActiveSlide({ buttonText: e.target.value })}
                      placeholder="e.g., Shop High Protein"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={activeSlide.buttonLink}
                      onChange={(e) => updateActiveSlide({ buttonLink: e.target.value })}
                      placeholder="e.g., /products?category=protein-nutrition"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Secondary Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.secondaryButtonText || ''}
                      onChange={(e) => updateActiveSlide({ secondaryButtonText: e.target.value })}
                      placeholder="e.g., Explore Collections"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Secondary Button Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.secondaryButtonLink || ''}
                      onChange={(e) => updateActiveSlide({ secondaryButtonLink: e.target.value })}
                      placeholder="e.g., /products"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('heroSlides')}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : '💾 Save Slide Changes'}
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= CURATED COLLECTIONS ================= */}
        {activeTab === 'curatedCollections' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Curated Collections (Homepage Category Grid)
                </h2>
                <p className="text-xs text-[#6B635B] font-light mt-0.5">
                  Customize the collection showcase cards shown under "Pure Food For Everyday Living" on the homepage. Add new categories, upload custom photography, and link directly to category or product pages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newCard: CollectionCard = {
                      id: `col-card-${Date.now()}`,
                      categorySlug: 'all',
                      tag: 'NEW COLLECTION',
                      title: 'Collection Title',
                      description: 'Describe the wholesome collection and ingredients.',
                      image: '/images/dry-fruit-ladoo-product.jpg',
                    };
                    updateCuratedCollections({
                      cards: [...curatedCollections.cards, newCard],
                    });
                    showToast('Added a new Collection Card! You can now edit its photo, tag, title, and link.');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#4E652B] hover:bg-[#3D5021] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  + Add Collection Card
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset Curated Collections cards to Nutri Ghar original defaults?')) {
                      updateCuratedCollections(DEFAULT_CURATED_COLLECTIONS);
                      showToast('Reset collections to defaults.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto"
                >
                  ↺ Reset Defaults
                </button>
              </div>
            </div>

            {/* Section Header Settings */}
            <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8E1D7] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C5838] block">
                Section Header &amp; Subtitle
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Eyebrow Pill Tag
                  </label>
                  <input
                    type="text"
                    value={curatedCollections.eyebrow ?? ''}
                    onChange={(e) => updateCuratedCollections({ eyebrow: e.target.value })}
                    placeholder="e.g. CURATED COLLECTIONS"
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={curatedCollections.heading ?? ''}
                    onChange={(e) => updateCuratedCollections({ heading: e.target.value })}
                    placeholder="e.g. Pure Food For Everyday Living"
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Section Description Paragraph
                  </label>
                  <textarea
                    value={curatedCollections.description ?? ''}
                    onChange={(e) => updateCuratedCollections({ description: e.target.value })}
                    rows={2}
                    placeholder="Describe your collections..."
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                  />
                </div>
              </div>
            </div>

            {/* Collection Cards */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                Collection Cards ({curatedCollections.cards.length} Cards)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {curatedCollections.cards.map((card, idx) => (
                  <div
                    key={card.id || `col-card-${idx}`}
                    className="bg-white p-5 rounded-2xl border border-[#E8E1D7] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#9C5838] text-[10px] font-bold uppercase tracking-wider border border-[#E8E1D7]">
                          Card #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-700">{card.title}</span>
                          {curatedCollections.cards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = curatedCollections.cards.filter((_, i) => i !== idx);
                                updateCuratedCollections({ cards: filtered });
                                showToast('Removed collection card.');
                              }}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer ml-2"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Image Preview & Upload */}
                      <div className="space-y-2">
                        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                          {card.image && (
                            <Image
                              src={card.image}
                              alt={card.title}
                              fill
                              className="object-cover"
                              sizes="400px"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[#9C5838] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-xs">
                            {card.tag || 'Tag'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="border border-dashed border-stone-300 rounded-xl p-2 text-center bg-[#FAF7F2]">
                            <input
                              type="file"
                              accept="image/*"
                              id={`card-upload-${idx}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const base64 = reader.result as string;
                                  updateCollectionCard(idx, { image: base64 });
                                  try {
                                    const res = await fetch('/api/upload', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        name: `card-${idx}-${Date.now()}`,
                                        type: file.type,
                                        base64OrUrl: base64,
                                      }),
                                    });
                                    const up = await res.json();
                                    if (up.success && up.url) {
                                      updateCollectionCard(idx, { image: up.url });
                                    }
                                  } catch {
                                    // keep base64
                                  }
                                  showToast(`Uploaded photo for Card #${idx + 1}!`);
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={`card-upload-${idx}`}
                              className="cursor-pointer text-[10px] font-bold text-[#1E382B] flex items-center justify-center gap-1 py-1"
                            >
                              <span>📸</span>
                              <span>Upload Photo</span>
                            </label>
                          </div>

                          <input
                            type="url"
                            value={card.image ?? ''}
                            onChange={(e) => updateCollectionCard(idx, { image: e.target.value })}
                            placeholder="Or paste image URL"
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-[11px] text-stone-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Card Text Settings */}
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                              Pill Tag
                            </label>
                            <input
                              type="text"
                              value={card.tag ?? ''}
                              onChange={(e) => updateCollectionCard(idx, { tag: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                              Category Slug
                            </label>
                            <input
                              type="text"
                              value={card.categorySlug ?? ''}
                              onChange={(e) => updateCollectionCard(idx, { categorySlug: e.target.value })}
                              placeholder="e.g. mithai"
                              className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Card Title
                          </label>
                          <input
                            type="text"
                            value={card.title ?? ''}
                            onChange={(e) => updateCollectionCard(idx, { title: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Card Description
                          </label>
                          <textarea
                            value={card.description ?? ''}
                            onChange={(e) => updateCollectionCard(idx, { description: e.target.value })}
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSection('curatedCollections')}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : '💾 Save Curated Collections'}
              </button>
            </div>
          </div>
        )}

        {/* ================= PRODUCT SPOTLIGHT ================= */}
        {activeTab === 'productSpotlight' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Product Spotlight (Signature Feature)
                </h2>
                <p className="text-xs text-[#6B635B] font-light mt-0.5">
                  Customize the editorial showcase box on the homepage (Protein Power Ladoo photo, macros, price, and copy).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset Product Spotlight to Nutri Ghar original defaults?')) {
                    updateProductSpotlight(DEFAULT_PRODUCT_SPOTLIGHT);
                    showToast('Reset product spotlight to defaults.');
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto"
              >
                ↺ Reset Defaults
              </button>
            </div>

            {/* Spotlight Preview & Image Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Image Preview & Upload */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E8E1D7] shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                  Product Spotlight Photography
                </span>

                <div className="relative h-64 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <Image
                    src={spotlight.image || DEFAULT_PRODUCT_SPOTLIGHT.image}
                    alt={spotlight.heading || 'Spotlight preview'}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute top-3 left-3 bg-[#9C5838] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                    {spotlight.tag || 'Signature Feature'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border border-dashed border-stone-300 rounded-xl p-3 text-center bg-[#FAF7F2]">
                    <input
                      type="file"
                      accept="image/*"
                      id="spotlight-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64 = reader.result as string;
                          updateProductSpotlight({ image: base64 });
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: `spotlight-${Date.now()}`,
                                type: file.type,
                                base64OrUrl: base64,
                              }),
                            });
                            const up = await res.json();
                            if (up.success && up.url) {
                              updateProductSpotlight({ image: up.url });
                            }
                          } catch {
                            // keep base64
                          }
                          showToast('Uploaded Product Spotlight image!');
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="spotlight-upload"
                      className="cursor-pointer text-xs font-bold text-[#1E382B] flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-xl">📸</span>
                      <span>Click to Upload New Photo</span>
                      <span className="text-[10px] text-stone-500 font-light">Supports JPG, PNG, WebP</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Or Paste Image Web URL
                    </label>
                    <input
                      type="url"
                      value={spotlight.image ?? ''}
                      onChange={(e) => updateProductSpotlight({ image: e.target.value })}
                      placeholder="/images/dry-fruit-ladoo-product.jpg"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Text, Macros, and Price Form */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8E1D7] shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C5838] block">
                  Copy, Macro Stats &amp; Pricing
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={spotlight.eyebrow ?? ''}
                      onChange={(e) => updateProductSpotlight({ eyebrow: e.target.value })}
                      placeholder="e.g. PRODUCT SPOTLIGHT"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={spotlight.tag ?? ''}
                      onChange={(e) => updateProductSpotlight({ tag: e.target.value })}
                      placeholder="e.g. Signature Feature"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Product Name / Heading
                    </label>
                    <input
                      type="text"
                      value={spotlight.heading ?? ''}
                      onChange={(e) => updateProductSpotlight({ heading: e.target.value })}
                      placeholder="e.g. Protein Power Ladoo"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Italic Subtitle
                    </label>
                    <input
                      type="text"
                      value={spotlight.headingItalic ?? ''}
                      onChange={(e) => updateProductSpotlight({ headingItalic: e.target.value })}
                      placeholder="e.g. Traditional Taste. Modern Nutrition."
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Story &amp; Ingredient Narrative
                    </label>
                    <textarea
                      value={spotlight.description ?? ''}
                      onChange={(e) => updateProductSpotlight({ description: e.target.value })}
                      rows={3}
                      placeholder="Describe ingredients and nutritional benefits..."
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  {/* 4 Macro stats */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Protein Value
                    </label>
                    <input
                      type="text"
                      value={spotlight.protein ?? ''}
                      onChange={(e) => updateProductSpotlight({ protein: e.target.value })}
                      placeholder="e.g. 12g"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Refined Sugar Value
                    </label>
                    <input
                      type="text"
                      value={spotlight.sugar ?? ''}
                      onChange={(e) => updateProductSpotlight({ sugar: e.target.value })}
                      placeholder="e.g. 0g"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Desi Ghee Value
                    </label>
                    <input
                      type="text"
                      value={spotlight.ghee ?? ''}
                      onChange={(e) => updateProductSpotlight({ ghee: e.target.value })}
                      placeholder="e.g. 100%"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Batch Freshness Note
                    </label>
                    <input
                      type="text"
                      value={spotlight.freshness ?? ''}
                      onChange={(e) => updateProductSpotlight({ freshness: e.target.value })}
                      placeholder="e.g. Weekly"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={spotlight.price ?? 349}
                      onChange={(e) => updateProductSpotlight({ price: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Price Note / Unit
                    </label>
                    <input
                      type="text"
                      value={spotlight.priceNote ?? ''}
                      onChange={(e) => updateProductSpotlight({ priceNote: e.target.value })}
                      placeholder="e.g. Price per 400g Box"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      value={spotlight.buttonText ?? ''}
                      onChange={(e) => updateProductSpotlight({ buttonText: e.target.value })}
                      placeholder="e.g. Add to Cart"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Target Product Slug
                    </label>
                    <input
                      type="text"
                      value={spotlight.productSlug ?? ''}
                      onChange={(e) => updateProductSpotlight({ productSlug: e.target.value })}
                      placeholder="e.g. dry-fruit-ladoo"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('productSpotlight')}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : '💾 Save Product Spotlight'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TESTIMONIALS (LOVED ACROSS INDIA) ================= */}
        {activeTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Loved Across Indian Homes (Customer Testimonials)
                </h2>
                <p className="text-xs text-[#6B635B] font-light mt-0.5">
                  Manage the customer reviews section displayed on the homepage. Edit names, cities, star ratings, and review texts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newItem: TestimonialItem = {
                      id: `test-${Date.now()}`,
                      name: 'Customer Name',
                      location: 'City',
                      product: 'Product Name',
                      rating: 5,
                      review: 'Write verified feedback here...',
                    };
                    updateTestimonials({
                      items: [...testimonials.items, newItem],
                    });
                    showToast('Added a new review card!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#4E652B] hover:bg-[#3D5021] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  + Add Testimonial
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset Customer Testimonials to Nutri Ghar original defaults?')) {
                      updateTestimonials(DEFAULT_TESTIMONIALS);
                      showToast('Reset testimonials to defaults.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  ↺ Reset Defaults
                </button>
              </div>
            </div>

            {/* Section Header Settings */}
            <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8E1D7] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C5838] block">
                Section Header
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Eyebrow Pill Tag
                  </label>
                  <input
                    type="text"
                    value={testimonials.eyebrow ?? ''}
                    onChange={(e) => updateTestimonials({ eyebrow: e.target.value })}
                    placeholder="e.g. VERIFIED EXPERIENCES"
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={testimonials.heading ?? ''}
                    onChange={(e) => updateTestimonials({ heading: e.target.value })}
                    placeholder="e.g. Loved Across Indian Homes"
                    className="w-full px-3.5 py-2 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                  />
                </div>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                Testimonial Cards ({testimonials.items.length} Reviews)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {testimonials.items.map((item, idx) => (
                  <div
                    key={item.id || `test-${idx}`}
                    className="bg-white p-5 rounded-2xl border border-[#E8E1D7] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C5838]">
                          Review #{idx + 1}
                        </span>
                        {testimonials.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = testimonials.items.filter((_, i) => i !== idx);
                              updateTestimonials({ items: filtered });
                              showToast('Removed review.');
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Star Rating */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Star Rating (1 - 5 Stars)
                        </label>
                        <select
                          value={item.rating ?? 5}
                          onChange={(e) => updateTestimonialItem(idx, { rating: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-amber-600 font-bold focus:outline-none"
                        >
                          <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                          <option value={4}>★★★★☆ (4 Stars - Great)</option>
                          <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                        </select>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Customer Review Quote
                        </label>
                        <textarea
                          value={item.review ?? ''}
                          onChange={(e) => updateTestimonialItem(idx, { review: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-[#1C1917] italic focus:outline-none"
                        />
                      </div>

                      {/* Customer Name, Location & Product */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={item.name ?? ''}
                            onChange={(e) => updateTestimonialItem(idx, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-[#1C1917] font-bold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                            City / Location
                          </label>
                          <input
                            type="text"
                            value={item.location ?? ''}
                            onChange={(e) => updateTestimonialItem(idx, { location: e.target.value })}
                            placeholder="e.g. Mumbai"
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-[#1C1917] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Product Purchased
                        </label>
                        <input
                          type="text"
                          value={item.product ?? ''}
                          onChange={(e) => updateTestimonialItem(idx, { product: e.target.value })}
                          placeholder="e.g. Besan Ladoo"
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-[#1C1917] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSection('testimonials')}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : '💾 Save Testimonials'}
              </button>
            </div>
          </div>
        )}

        {/* ================= SINGLE HERO (LEGACY) ================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                Single Static Hero Banner
              </h2>
              <p className="text-xs text-[#6B635B] font-light mt-0.5">
                Customize legacy static hero banner configuration if needed.
              </p>
            </div>

            {/* Single Hero Image Upload */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Hero Banner Photo / Image
                </span>
                {content.hero.heroImage && (
                  <button
                    type="button"
                    onClick={() => setContent({ ...content, hero: { ...content.hero, heroImage: '' } })}
                    className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-[#D8CEBE] hover:border-[#1E382B] rounded-2xl p-4 text-center bg-white transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    id="single-hero-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64 = reader.result as string;
                        setContent({
                          ...content,
                          hero: { ...content.hero, heroImage: base64 },
                        });
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: `hero-${Date.now()}`,
                              type: file.type,
                              base64OrUrl: base64,
                            }),
                          });
                          const uploadData = await res.json();
                          if (uploadData.success && uploadData.url) {
                            setContent({
                              ...content,
                              hero: { ...content.hero, heroImage: uploadData.url },
                            });
                          }
                        } catch {
                          // Keep base64
                        }
                        showToast('Hero image uploaded!');
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="single-hero-upload"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-1.5"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="text-xs font-bold text-[#1E382B] hover:underline">
                      Click to Upload Hero Image File
                    </span>
                    <span className="text-[10px] text-stone-500 font-light">
                      JPG, PNG, WebP from your computer or phone
                    </span>
                  </label>
                </div>

                {/* URL Input & Preview */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Or Paste Image Web URL
                    </label>
                    <input
                      type="url"
                      value={content.hero.heroImage}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, heroImage: e.target.value },
                        })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  {content.hero.heroImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-stone-300 shrink-0 bg-stone-100">
                        <Image
                          src={content.hero.heroImage}
                          alt="Hero preview"
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Active visual preview
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={content.hero.eyebrow}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Main Headline (Part 1)
                </label>
                <input
                  type="text"
                  value={content.hero.headline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Italic Accent Headline (Part 2)
                </label>
                <input
                  type="text"
                  value={content.hero.headlineItalic}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, headlineItalic: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={content.hero.primaryButtonText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, primaryButtonText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={content.hero.secondaryButtonText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, secondaryButtonText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Supporting Text Description
              </label>
              <textarea
                value={content.hero.supportingText}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, supportingText: e.target.value },
                  })
                }
                rows={3}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* ================= ANNOUNCEMENT BAR ================= */}
        {activeTab === 'announcement' && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Announcement Bar
            </h2>
            <p className="text-xs text-[#6B635B] font-light">
              Top bar displayed across the website for deliveries, offers, and batch updates.
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1C1917] block">
                  Announcement Bar Visibility
                </span>
                <span className="text-[11px] text-stone-500 font-light">
                  Show or hide the top banner across all pages.
                </span>
              </div>
              <input
                type="checkbox"
                checked={content.announcement.enabled}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-[#1E382B] rounded focus:ring-[#1E382B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Announcement Text
              </label>
              <input
                type="text"
                value={content.announcement.text}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, text: e.target.value },
                  })
                }
                placeholder="Freshly Made • Wholesome Ingredients • Delivered with Care"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* ================= BRAND STORY ================= */}
        {activeTab === 'brandStory' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                Brand Story Section
              </h2>
              <p className="text-xs text-[#6B635B] font-light mt-0.5">
                Nutri Ghar heritage story, kitchen philosophy, and photo gallery.
              </p>
            </div>

            {/* Brand Story Photo Upload */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Brand Story Photo / Kitchen Visual
                </span>
                {content.brandStory.storyImage && (
                  <button
                    type="button"
                    onClick={() => setContent({ ...content, brandStory: { ...content.brandStory, storyImage: '' } })}
                    className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-[#D8CEBE] hover:border-[#1E382B] rounded-2xl p-4 text-center bg-white transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    id="brand-story-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setContent({
                          ...content,
                          brandStory: { ...content.brandStory, storyImage: reader.result as string },
                        });
                        showToast('Brand story photo uploaded!');
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="brand-story-upload"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-1.5"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="text-xs font-bold text-[#1E382B] hover:underline">
                      Click to Upload Story Image File
                    </span>
                    <span className="text-[10px] text-stone-500 font-light">
                      JPG, PNG, WebP from your computer or phone
                    </span>
                  </label>
                </div>

                {/* URL Input & Preview */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Or Paste Image Web URL
                    </label>
                    <input
                      type="url"
                      value={content.brandStory.storyImage}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          brandStory: { ...content.brandStory, storyImage: e.target.value },
                        })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                    />
                  </div>

                  {content.brandStory.storyImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-stone-300 shrink-0 bg-stone-100">
                        <Image
                          src={content.brandStory.storyImage}
                          alt="Story preview"
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Active visual preview
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={content.brandStory.eyebrow}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brandStory: { ...content.brandStory, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Heading Line 1
                </label>
                <input
                  type="text"
                  value={content.brandStory.heading}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brandStory: { ...content.brandStory, heading: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Heading Line 2 (Italic Accent)
                </label>
                <input
                  type="text"
                  value={content.brandStory.headingItalic}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brandStory: { ...content.brandStory, headingItalic: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Philosophy Quote
                </label>
                <input
                  type="text"
                  value={content.brandStory.quote}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brandStory: { ...content.brandStory, quote: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Narrative Paragraphs
              </label>
              <textarea
                value={content.brandStory.paragraph1}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brandStory: { ...content.brandStory, paragraph1: e.target.value },
                  })
                }
                rows={2}
                placeholder="Paragraph 1..."
                className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
              <textarea
                value={content.brandStory.paragraph2}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brandStory: { ...content.brandStory, paragraph2: e.target.value },
                  })
                }
                rows={2}
                placeholder="Paragraph 2..."
                className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
              <textarea
                value={content.brandStory.paragraph3}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brandStory: { ...content.brandStory, paragraph3: e.target.value },
                  })
                }
                rows={2}
                placeholder="Paragraph 3..."
                className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* ================= CONTACT INFO ================= */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Customer Support & Contact Info
            </h2>
            <p className="text-xs text-[#6B635B] font-light">
              Kitchen address, phone numbers, and WhatsApp channels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={content.contact.phone}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contact: { ...content.contact, phone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contact: { ...content.contact, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={content.contact.whatsapp}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contact: { ...content.contact, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  FSSAI License Info
                </label>
                <input
                  type="text"
                  value={content.contact.fssaiLicense}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contact: { ...content.contact, fssaiLicense: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Kitchen Address
              </label>
              <input
                type="text"
                value={content.contact.address}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* ================= FOOTER & SOCIALS ================= */}
        {activeTab === 'footer' && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Footer & Social Channels
            </h2>
            <p className="text-xs text-[#6B635B] font-light">
              About text, social profiles, and copyright notes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={content.footer.instagramUrl}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, instagramUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  WhatsApp Direct URL
                </label>
                <input
                  type="url"
                  value={content.footer.whatsappUrl}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, whatsappUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={content.footer.facebookUrl}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, facebookUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Footer Brand Summary Text
              </label>
              <textarea
                value={content.footer.aboutText}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, aboutText: e.target.value },
                  })
                }
                rows={2}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={content.footer.copyrightText}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, copyrightText: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* ================= NEWSLETTER ================= */}
        {activeTab === 'newsletter' && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Newsletter Section
            </h2>
            <p className="text-xs text-[#6B635B] font-light">
              Heading and text for the homepage email signup section.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Newsletter Heading
              </label>
              <input
                type="text"
                value={content.newsletter.heading}
                onChange={(e) =>
                  setContent({
                    ...content,
                    newsletter: { ...content.newsletter, heading: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Description Subtitle
              </label>
              <textarea
                value={content.newsletter.description}
                onChange={(e) =>
                  setContent({
                    ...content,
                    newsletter: { ...content.newsletter, description: e.target.value },
                  })
                }
                rows={2}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Privacy / Anti-Spam Note
              </label>
              <input
                type="text"
                value={content.newsletter.promoNote}
                onChange={(e) =>
                  setContent({
                    ...content,
                    newsletter: { ...content.newsletter, promoNote: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
              />
            </div>
          </div>
        )}

        {/* Action Save Bar */}
        <div className="flex items-center justify-end pt-4 border-t border-[#E8E1D7]">
          <button
            type="button"
            onClick={() => handleSaveSection(activeTab)}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : `Save ${tabs.find((t) => t.id === activeTab)?.label} →`}
          </button>
        </div>

      </div>
    </div>
  );
}
