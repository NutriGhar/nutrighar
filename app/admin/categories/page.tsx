'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category, Product } from '@/types/content';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [icon, setIcon] = useState('📦');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetch(`/api/categories?all=true&t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/products?all=true&t=${Date.now()}`, { cache: 'no-store' }),
      ]);
      const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);

      if (catData.success) setCategories(catData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80');
    setIcon('🍯');
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setImage(category.image || '');
    setIcon(category.icon || '📦');
    setIsActive(category.isActive);
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, isActive: !c.isActive } : c))
        );
        showToast(`Category ${!category.isActive ? 'Activated' : 'Deactivated'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        image: image.trim(),
        icon: icon.trim(),
        isActive,
      };

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data.data } : c))
          );
          showToast('Category updated successfully');
          setIsModalOpen(false);
        } else {
          setError(data.error || 'Failed to update category');
        }
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setCategories((prev) => [...prev, data.data]);
          showToast('Category created successfully');
          setIsModalOpen(false);
        } else {
          setError(data.error || 'Failed to create category');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductCountForCategory = (cat: Category) => {
    return products.filter((p) => p.categoryId === cat.id || p.categorySlug === cat.slug).length;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            Store Taxonomy
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Category Management
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Organize products into curated collections for customer navigation and filtering.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm inline-flex items-center justify-center gap-2"
        >
          <span>+ Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-stone-500 font-light">
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => {
            const count = getProductCountForCategory(cat);
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-[#E8E1D7] overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Category Banner Image */}
                  <div className="relative h-36 w-full bg-[#EBE2D5]">
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-2xl">{cat.icon || '📦'}</span>
                      <span className="text-xs bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium">
                        {count} SKUs
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                        {cat.name}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-300'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <p className="text-xs text-[#6B635B] font-light line-clamp-2">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E1D7] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-stone-500">
                    slug: /{cat.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-[#D8CEBE] text-xs font-semibold text-[#1E382B] transition-colors"
                  >
                    Edit Category
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E1D7] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  required
                  placeholder="e.g. Cold Pressed Oils"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. cold-pressed-oils"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of the collection..."
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#1E382B] rounded focus:ring-[#1E382B]"
                />
                <label htmlFor="catActive" className="text-xs font-semibold text-[#1C1917] cursor-pointer">
                  Activate Category (Visible on Customer Storefront)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
