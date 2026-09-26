'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/content';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/categories?all=true&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId(data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Image Upload helper
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name.replace(/\.[^/.]+$/, ''),
              type: file.type,
              base64OrUrl: base64,
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            setImage(data.url);
          }
        } catch {
          // Keep base64 as fallback
        }
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

    if (Number(price) < 0 || Number(stockQuantity) < 0) {
      setError('Price and Stock Quantity must be positive values.');
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

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create product');
        setIsSubmitting(false);
        return;
      }

      window.location.href = '/admin/products';
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
      setIsSubmitting(false);
    }
  };

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
            Add New Product SKU
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Create a new item in your store catalog with ingredients, pricing, and stock limits.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Information */}
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
                onChange={handleNameChange}
                required
                placeholder="e.g. Pistachio Kaju Ladoo"
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
                placeholder="e.g. pistachio-kaju-ladoo"
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
              placeholder="Describe the taste, culinary craft, aroma, and homemade quality..."
              className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              2. Pricing & Inventory Management
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Selling price, MRP, stock count, and low-inventory alerts</p>
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
                step="1"
                placeholder="299"
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
                step="1"
                placeholder="349"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Current Stock Quantity *
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                min="0"
                placeholder="50"
                className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-base text-stone-900 font-medium focus:bg-white focus:border-[#1E382B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                min="0"
                placeholder="10"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 hover:border-[#1E382B] transition-all group p-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1E382B] flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <p className="mb-0.5 text-xs font-bold text-stone-700">
                      Upload from Computer / Phone
                    </p>
                    <p className="text-[10px] text-stone-500">
                      PNG, JPG, WEBP
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-col justify-center p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Or Enter Image URL
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#1E382B]"
                  />
                  <p className="text-[10px] text-stone-500">
                    Paste any public image link or CDN URL.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-stone-300 shadow-xs bg-white shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md inline-block">
                      ✓ Image Selected
                    </p>
                    <div className="text-[11px] text-stone-500 font-mono truncate max-w-md">
                      {image.startsWith('data:') ? 'Local Image File' : image}
                    </div>
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
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="ml-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
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
            <p className="text-xs text-stone-500 mt-0.5">Comma-separated list of ingredients and nutritional highlights</p>
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
              <span>Publish Product to Catalog →</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
