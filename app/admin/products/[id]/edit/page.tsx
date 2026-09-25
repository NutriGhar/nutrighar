'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Category, Product } from '@/lib/db';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [image, setImage] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories?all=true'),
          fetch(`/api/products/${productId}`),
        ]);

        const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);

        if (catData.success) {
          setCategories(catData.data);
        }

        if (prodData.success && prodData.data) {
          const p: Product = prodData.data;
          setName(p.name);
          setSlug(p.slug);
          setDescription(p.description);
          setPrice(String(p.price));
          setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
          setCategoryId(p.categoryId || (catData.data?.[0]?.id ?? ''));
          setStockQuantity(String(p.stockQuantity));
          setLowStockThreshold(String(p.lowStockThreshold));
          setImage(p.image);
          setIngredientsText(p.ingredients?.join(', ') || '');
          setBenefitsText(p.benefits?.join(', ') || '');
          setIsFeatured(Boolean(p.isFeatured));
          setIsBestSeller(Boolean(p.isBestSeller));
          setIsActive(Boolean(p.isActive));
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  // Image Upload helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim() || !price || !categoryId || !image.trim()) {
      setError('Please fill in all required fields: Name, Description, Price, Category, and Image.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedCat = categories.find((c) => c.id === categoryId);

      const ingredients = ingredientsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const benefits = benefitsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId,
        categorySlug: selectedCat?.slug || 'healthy-snacks',
        image: image.trim(),
        images: [image.trim()],
        ingredients: ingredients.length > 0 ? ingredients : ['Natural ingredients'],
        benefits: benefits.length > 0 ? benefits : ['Freshly handcrafted'],
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 10,
        isFeatured,
        isBestSeller,
        isActive,
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update product');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete product');
        setIsDeleting(false);
        setShowDeleteModal(false);
        return;
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1E382B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
            Loading Product Information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-300 pb-6">
        <div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-[#9C5838] hover:text-[#1E382B] uppercase tracking-wider inline-flex items-center gap-1.5 mb-2"
          >
            <span>← Back to Products Catalog</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-bold tracking-tight">
            Edit Product: <span className="text-[#1E382B]">{name}</span>
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Update pricing, stock levels, ingredients, and storefront visibility flags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto cursor-pointer"
        >
          🗑️ Delete SKU
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Details */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              1. Basic Information
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Title, URL slug, category, and taste description</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              2. Pricing & Inventory Management
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Selling price, MRP, stock count, and threshold</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-bold focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Original Price (₹ MRP) (Optional)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                min="0"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                min="0"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                min="0"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Product Imagery */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              3. Product Image
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Upload a photo of the product directly from your computer or phone</p>
          </div>

          <div className="space-y-4">
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 hover:border-[#1E382B] transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1E382B] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    📷
                  </div>
                  <p className="mb-1 text-sm font-bold text-stone-700">
                    Click or tap to upload product photo
                  </p>
                  <p className="text-xs text-stone-500">
                    Supports PNG, JPG, JPEG, WEBP (Direct file upload)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-stone-300 shadow-xs bg-white shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md inline-block">
                      ✓ Current Product Photo
                    </p>
                    <div>
                      <label className="inline-block px-4 py-2 bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors">
                        🔄 Upload New Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Ingredients & Benefits */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              4. Ingredients & Benefits
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Comma-separated ingredients and highlights</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Ingredients (Comma Separated)
              </label>
              <input
                type="text"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="e.g. Roasted Gram Flour, Pure A2 Cow Ghee, Wild Honey, Cardamom"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Health Benefits (Comma Separated)
              </label>
              <input
                type="text"
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                placeholder="e.g. 12g Clean Protein, Zero Refined Sugar, Muscle Recovery Support"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Badges & Visibility */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              5. Storefront Badges & Visibility
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Control where this product appears on the website</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-stone-200 hover:border-[#1E382B] transition-colors cursor-pointer bg-stone-50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 accent-[#1E382B] rounded"
              />
              <div>
                <span className="text-sm font-bold text-stone-900 block">Active SKU</span>
                <span className="text-xs text-stone-500">Visible on storefront</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-stone-200 hover:border-[#1E382B] transition-colors cursor-pointer bg-stone-50">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 accent-[#1E382B] rounded"
              />
              <div>
                <span className="text-sm font-bold text-stone-900 block">Featured Product</span>
                <span className="text-xs text-stone-500">Highlighted in lists</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-stone-200 hover:border-[#1E382B] transition-colors cursor-pointer bg-stone-50">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-5 h-5 accent-[#1E382B] rounded"
              />
              <div>
                <span className="text-sm font-bold text-stone-900 block">Bestseller Badge</span>
                <span className="text-xs text-stone-500">Top customer badge</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-stone-300">
          <Link
            href="/admin/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save Product Changes →</span>
            )}
          </button>
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-xl">
              🗑️
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-stone-900">Delete Product SKU?</h3>
              <p className="text-sm text-stone-600">
                Are you sure you want to delete <strong className="text-stone-900">{name}</strong>? This action will remove it from the catalog.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border-2 border-stone-300 rounded-xl text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
