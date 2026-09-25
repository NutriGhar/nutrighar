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

  // Load live products & categories once on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?active=true'),
          fetch('/api/categories'),
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-100">
        <div className="w-full max-w-[1540px] mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-orange-600 font-semibold hover:text-orange-700 text-sm">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 animate-fadeIn" key={activeCategoryTitle}>
            {activeCategoryTitle}
          </h1>
          <p className="text-xs sm:text-base lg:text-lg text-gray-700 max-w-3xl font-light leading-relaxed animate-fadeIn" key={activeCategoryDescription}>
            {activeCategoryDescription}
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                🔍 Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                📂 Category
              </label>
              <select
                value={categoryParam}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer text-sm"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                ⭐ Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {filteredProducts.length}
              <span className="text-gray-600 font-normal ml-2">
                product{filteredProducts.length !== 1 ? 's' : ''} found
              </span>
            </p>
          </div>
          {(categoryParam || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                router.push('/products');
              }}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                router.push('/products');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer text-sm"
            >
              Reset Filters
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
