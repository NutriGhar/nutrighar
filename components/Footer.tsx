'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useContent } from '@/context/ContentContext';

export default function Footer() {
  const pathname = usePathname();
  const { content, whatsappLink, email } = useContent();

  // Do not render customer footer on /admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const aboutText =
    content?.footer?.aboutText ||
    'Nutri Ghar represents healthy food made with the warmth and trust of home. Small batches crafted with pure ingredients, zero chemical preservatives, and traditional recipes.';
  const instagramUrl = content?.footer?.instagramUrl || 'https://instagram.com';
  const copyrightText =
    content?.footer?.copyrightText ||
    `© ${new Date().getFullYear()} Nutri Ghar. Pure homemade nutrition crafted with care.`;

  return (
    <footer className="bg-[#13241C] text-[#FAF7F2] pt-12 sm:pt-20 pb-12 border-t border-[#1E382B]">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-12 pb-12 sm:pb-16 border-b border-[#2A4F3C]/40">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-5 space-y-4 sm:space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-md border border-stone-300 shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/nutrighar-logo-emblem.png"
                  alt="Nutri Ghar Logo Emblem"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none">
                  Nutri Ghar
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D49A4B] font-medium mt-1">
                  Homemade Wellness
                </span>
              </div>
            </Link>
            <p className="text-stone-300 text-sm leading-relaxed max-w-sm font-light">
              {aboutText}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400 uppercase tracking-widest font-medium">
              <span>Pure Ingredients</span>
              <span className="text-[#D49A4B]">•</span>
              <span>Made in India</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif text-base text-white font-semibold tracking-wide">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              <li>
                <Link href="/products" className="hover:text-[#D49A4B] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/#collections" className="hover:text-[#D49A4B] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/#bestsellers" className="hover:text-[#D49A4B] transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/#story" className="hover:text-[#D49A4B] transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-serif text-base text-white font-semibold tracking-wide">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              <li>
                <Link href="/products?category=mithai" className="hover:text-[#D49A4B] transition-colors">
                  Mithai & Ladoos
                </Link>
              </li>
              <li>
                <Link href="/products?category=peanut-butter" className="hover:text-[#D49A4B] transition-colors">
                  Peanut Butter
                </Link>
              </li>
              <li>
                <Link href="/products?category=protein-nutrition" className="hover:text-[#D49A4B] transition-colors">
                  Protein Nutrition
                </Link>
              </li>
              <li>
                <Link href="/products?category=healthy-snacks" className="hover:text-[#D49A4B] transition-colors">
                  Roasted Snacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif text-base text-white font-semibold tracking-wide">
              Connect With Us
            </h4>
            <p className="text-stone-300 text-sm font-light">
              Have questions about batches, dietary needs, or bulk orders?
            </p>
            <div className="pt-1 flex flex-col gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1E382B] hover:bg-[#2A4F3C] text-stone-100 text-xs font-semibold uppercase tracking-wider transition-colors border border-[#2A4F3C]"
              >
                <span>Chat on WhatsApp</span>
                <span>→</span>
              </a>
              <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D49A4B] transition-colors">
                  Instagram
                </a>
                <span>•</span>
                <a href={`mailto:${email}`} className="hover:text-[#D49A4B] transition-colors">
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 font-light gap-4">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-stone-200 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-stone-200 transition-colors">
              Contact
            </Link>
            <span>FSSAI Certified Kitchen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
