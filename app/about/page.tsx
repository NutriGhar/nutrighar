import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="about-page bg-[#FAF7F2] text-[#1C1917] overflow-x-hidden selection:bg-[#EAE0D2] selection:text-[#1E382B]">
      
      {/* 1. Hero Philosophy Header Section (Centered) */}
      <section className="relative py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#E8E1D7]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md border-2 border-stone-200 bg-white mb-6 relative">
            <Image
              src="/images/nutrighar-logo-emblem.png"
              alt="Nutri Ghar Seal of Purity"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9C5838] block">
              The Nutri Ghar Philosophy
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1C1917] tracking-tight leading-tight">
              Homemade with Love, <br />
              <span className="italic text-[#1E382B]">Nourishing Every Life.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-[#6B635B] font-light leading-relaxed max-w-2xl mx-auto pt-2">
              We believe pure wellness begins with honest kitchen cooking, traditional Indian recipes, and 100% natural ingredients.
            </p>
          </div>

        </div>
      </section>

      {/* 2. Centerpiece: Full Brand Infographic Poster (Centered) */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E8E1D7]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <div className="text-center mb-10 space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#4E652B] block">
              Pure Ingredients • Clean Nutrition • Artisanal Craft
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal text-[#1C1917] tracking-tight">
              What Makes Nutri Ghar Special?
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#6B635B] font-light leading-relaxed">
              From stone-ground nut butters to pure A2 desi ghee ladoos, explore everything that goes into our handcrafted batches.
            </p>
          </div>

          {/* Clean Infographic Showcase Frame */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-[#FAF7F2] p-3 sm:p-5">
            <div className="relative w-full h-[340px] sm:h-[480px] md:h-[620px] lg:h-[720px] rounded-2xl overflow-hidden bg-white">
              <Image
                src="/images/nutrighar-infographic.png"
                alt="Nutri Ghar Brand Values and Clean Ingredients Infographic"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 900px"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. 8 Core Promises Grid (Centered) */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#E8E1D7]">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2.5 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight">
              Why Choose Nutri Ghar?
            </h2>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#9C5838] font-bold">
              Our Zero Compromise Quality Checklist
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">🚫</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">No Maida</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Zero refined flour in any recipe</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">🥥</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">No Palm Oil</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">100% pure nut oils &amp; desi cow ghee</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">🎨</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">No Artificial Colors</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Natural colors from real ingredients</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">🍯</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">No Refined Sugar</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Sweetened with jaggery, honey &amp; dates</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">🥜</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">Premium Ingredients</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Jumbo almonds, cashews &amp; whole millets</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">👩‍🍳</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">Fresh On Order</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Handcrafted in small hygienic batches</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">✨</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">Hygienic &amp; Pure</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">FSSAI certified artisanal kitchen</p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-2.5 hover:shadow-md transition-shadow">
              <div className="text-3xl">❤️</div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">Love in Every Bite</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">Because your family deserves the best</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section (Centered) */}
      <section className="py-20 sm:py-28 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 flex flex-col items-center">
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
            Taste The Purity of Nutri Ghar
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
            Explore our bestselling handmade mithais, stone-ground peanut butters, and healthy snack assortments.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <span>Explore All Products</span>
          <span>→</span>
        </Link>
      </section>

    </div>
  );
}
