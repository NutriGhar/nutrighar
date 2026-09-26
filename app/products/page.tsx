'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/data/products';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';
import { Product } from '@/types/product';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize local search text with URL search parameter
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Load live products & categories on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?active=true&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' }),
        ]);

        const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);

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

        if (catData.success && catData.data?.length > 0) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error('Error fetching live products in ProductsContent:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const selCat = categoryParam.trim().toLowerCase();
    const q = searchQuery.trim().toLowerCase();

    let filtered = products.filter((product) => {
      const catSlug = (product.categorySlug || product.category || '').toLowerCase();
      const catId = (product.categoryId || '').toLowerCase();
      const prodName = product.name.toLowerCase();
      
      let matchesCategory = false;
      if (!selCat) {
        matchesCategory = true;
      } else if (selCat === 'mithai') {
        matchesCategory =
          catSlug === 'mithai' ||
          catId === 'cat-mithai' ||
          catSlug.includes('mithai') ||
          prodName.includes('ladoo') ||
          prodName.includes('mithai');
      } else if (selCat === 'peanut-butter') {
        matchesCategory =
          catSlug === 'peanut-butter' ||
          catId === 'cat-peanut-butter' ||
          prodName.includes('peanut butter') ||
          prodName.includes('peanut') ||
          prodName.includes('spread');
      } else if (selCat === 'protein-nutrition') {
        matchesCategory =
          catSlug === 'protein-nutrition' ||
          catId === 'cat-protein-nutrition' ||
          prodName.includes('protein mix') ||
          prodName.includes('high protein') ||
          prodName.includes('protein power');
      } else if (selCat === 'healthy-snacks') {
        matchesCategory =
          catSlug === 'healthy-snacks' ||
          catId === 'cat-healthy-snacks' ||
          prodName.includes('roasted') ||
          prodName.includes('energy bites') ||
          prodName.includes('dry fruit') ||
          prodName.includes('assortment');
      } else {
        matchesCategory = catSlug === selCat || catId === selCat;
      }

      const matchesSearch =
        !q ||
        prodName.includes(q) ||
        product.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    // Sort products
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'featured') {
      filtered = [...filtered].sort((a, b) => {
        const aFeat = a.isFeatured || a.featured;
        const bFeat = b.isFeatured || b.featured;
        if (aFeat === bFeat) return 0;
        return aFeat ? -1 : 1;
      });
    }

    return filtered;
  }, [products, categoryParam, searchQuery, sortBy]);

  const handleCategorySelect = (newCat: string) => {
    if (newCat) {
      router.push(`/products?category=${encodeURIComponent(newCat)}`);
    } else {
      router.push('/products');
    }
  };

  const categoryOptions = [
    { id: '', name: 'All Categories' },
    ...categories.map((c: any) => ({ id: c.slug || c.id, name: c.name })),
  ];

  // Dynamic titles based on active category
  const activeCategoryTitle = useMemo(() => {
    const sel = categoryParam.toLowerCase();
    if (sel === 'peanut-butter' || sel.includes('peanut')) return 'Stone-Ground Peanut Butter & Spreads';
    if (sel === 'mithai' || sel.includes('mithai')) return 'Pure Desi Ghee Mithai & Ladoos';
    if (sel === 'protein-nutrition' || sel.includes('protein')) return 'High Protein Nutrition & Energy Treats';
    if (sel === 'healthy-snacks' || sel.includes('snack')) return 'Healthy Roasted Snacks & Dry Fruits';
    if (sel) {
      const found = categories.find((c: any) => c.slug === sel || c.id === sel);
      if (found) return found.name;
    }
    return 'Shop All Homemade Products';
  }, [categoryParam, categories]);

  const activeCategoryDescription = useMemo(() => {
    const sel = categoryParam.toLowerCase();
    if (sel === 'peanut-butter' || sel.includes('peanut')) return '100% slow-roasted peanuts, stone-ground daily with zero palm oil or chemical additives.';
    if (sel === 'mithai' || sel.includes('mithai')) return 'Authentic Indian ladoos and sweets slow-cooked in 100% pure A2 desi cow ghee and whole dry fruits.';
    if (sel === 'protein-nutrition' || sel.includes('protein')) return 'Clean fitness nutrition crafted with whey protein, whole nuts, and zero refined sugars.';
    if (sel === 'healthy-snacks' || sel.includes('snack')) return 'Slow-roasted California almonds, whole cashews, and guilt-free seed assortments.';
    return 'Discover our complete range of homemade nutrition products, carefully crafted for your health and wellness.';
  }, [categoryParam]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] pb-24">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#E8E1D7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1540px] mx-auto">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4E652B] hover:text-[#3D5021] transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9C5838] block mb-2">
            Curated Nutri Ghar Pantry
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1C1917] mb-3 tracking-tight animate-fadeIn" key={activeCategoryTitle}>
            {activeCategoryTitle}
          </h1>
          <p className="text-xs sm:text-base lg:text-lg text-stone-600 max-w-3xl font-light leading-relaxed animate-fadeIn" key={activeCategoryDescription}>
            {activeCategoryDescription}
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Big Search and Filters Card with Generous Padding */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-8 mb-8 sm:mb-12 shadow-xs space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 items-end">
            
            {/* Search Input (Big & Prominent) */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800">
                Search Products
              </label>
              <div className="flex items-center h-12 sm:h-14 px-3.5 sm:px-4 border-2 border-stone-200 hover:border-stone-300 focus-within:border-[#4E652B] focus-within:ring-2 focus-within:ring-[#4E652B]/20 rounded-xl sm:rounded-2xl bg-[#FAF7F2]/50 focus-within:bg-white transition-all gap-2.5 sm:gap-3">
                <svg
                  className="w-5 h-5 text-[#4E652B] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search ladoos, peanut butter, clean protein..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-base font-semibold text-stone-900 placeholder:text-stone-400 p-0 focus:ring-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 text-xs font-bold flex items-center justify-center cursor-pointer shrink-0"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter (Dropdown) */}
            <div className="hidden md:block md:col-span-3 space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800">
                📂 Category
              </label>
              <div className="relative">
                <select
                  value={categoryParam}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full h-12 sm:h-14 px-4 pr-10 border-2 border-stone-200 hover:border-stone-300 focus:border-[#4E652B] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E652B]/20 transition-all cursor-pointer bg-[#FAF7F2]/50 appearance-none"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800">
                ⭐ Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-12 sm:h-14 px-3.5 sm:px-4 pr-10 border-2 border-stone-200 hover:border-stone-300 focus:border-[#4E652B] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E652B]/20 transition-all cursor-pointer bg-[#FAF7F2]/50 appearance-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Quick Category Filter Pills (1-Tap Switching on Mobile & Desktop) */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Filter:
            </span>
            {categoryOptions.map((cat) => {
              const isSelected = (!categoryParam && !cat.id) || categoryParam.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id || 'all'}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-[#4E652B] text-[#E7F0AB] border-[#4E652B] shadow-xs'
                      : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200/80 border-stone-200'
                  }`}
                >
                  {cat.id === '' && '✨ All Products'}
                  {cat.id === 'mithai' && '🍯 Pure Ghee Mithai'}
                  {cat.id === 'peanut-butter' && '🥜 Peanut Butter'}
                  {cat.id === 'protein-nutrition' && '🌿 Clean Protein'}
                  {cat.id === 'healthy-snacks' && '🌰 Roasted Snacks'}
                  {!['', 'mithai', 'peanut-butter', 'protein-nutrition', 'healthy-snacks'].includes(cat.id) && cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Bar with Generous Breathing Space Above and Below */}
        <div className="flex items-center justify-between pb-5 mb-8 sm:mb-12 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4E652B] shrink-0" />
            <p className="text-sm sm:text-lg font-bold text-stone-900">
              Showing <span className="font-serif text-base sm:text-2xl font-extrabold text-[#1E382B]">{filteredProducts.length}</span>{' '}
              <span className="text-stone-600 font-normal">
                {filteredProducts.length === 1 ? 'handcrafted product' : 'handcrafted products'} found
              </span>
            </p>
          </div>

          {(categoryParam || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                router.push('/products');
              }}
              className="text-xs sm:text-sm font-bold text-[#9C5838] hover:text-[#7D4226] uppercase tracking-wider underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Products Grid with Generous Spacing */}
        {filteredProducts.length > 0 ? (
          <div className="pt-2">
            <ProductGrid products={filteredProducts} />
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">No products matched your criteria</h3>
            <p className="text-stone-500 mb-6 text-sm font-light">Try searching with a different ingredient name or reset filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                router.push('/products');
              }}
              className="px-8 py-3.5 bg-[#4E652B] hover:bg-[#3D5021] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#1E382B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
