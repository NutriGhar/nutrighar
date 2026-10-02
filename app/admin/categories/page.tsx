'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category, Product } from '@/types/content';

const SUGGESTED_ICONS = ['🍯', '🌾', '🥜', '🫒', '🍪', '🥥', '🍵', '📦', '🌿', '🧈'];

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

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setImage('https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80');
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

  // Image upload handler from computer or phone
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scaleSize = Math.min(1, MAX_WIDTH / img.width);
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL(file.type || 'image/jpeg', 0.88);
          setImage(compressedBase64);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `cat-${file.name.replace(/\.[^/.]+$/, '')}`,
                type: file.type || 'image/jpeg',
                base64OrUrl: compressedBase64,
              }),
            });
            const data = await res.json();
            if (data.success && data.url) setImage(data.url);
          } catch (uploadErr) {
            console.error('Category image upload failed:', uploadErr);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id && c.slug !== categoryToDelete.slug));
        showToast('Category successfully deleted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
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
        icon: icon.trim() || '📦',
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
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/products"
              className="text-xs uppercase tracking-wider text-stone-500 hover:text-[#1E382B] font-bold transition-colors"
            >
              ← Products Catalog
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9C5838] font-bold">
              Taxonomy
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Category Management
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Create and edit product collections, upload cover photos, and toggle storefront visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-3 bg-white hover:bg-[#EFE8DE] text-[#1E382B] rounded-xl border border-[#D8CEBE] transition-colors shadow-sm cursor-pointer"
            title="Reload Categories"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Add New Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-500 font-light bg-white rounded-3xl border border-[#E8E1D7]">
            Loading categories catalog...
          </div>
        ) : (
          categories.map((cat) => {
            const count = getProductCountForCategory(cat);
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-[#E8E1D7] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Category Banner Image */}
                  <div className="relative h-40 w-full bg-[#EBE2D5] overflow-hidden group">
                    {cat.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cat.image}
                        alt={cat.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-2xl drop-shadow-md">{cat.icon || '📦'}</span>
                      <span className="text-xs bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full font-bold border border-white/20">
                        {count} Products
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#1C1917] line-clamp-1">
                        {cat.name}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {cat.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </div>

                    <p className="text-xs text-[#6B635B] font-light line-clamp-2 min-h-[32px]">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E1D7] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-stone-500 truncate max-w-[120px]">
                    /{cat.slug}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-[#D8CEBE] text-xs font-semibold text-[#1E382B] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(cat)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E1D7] shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-4">
              <div>
                <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-[#6B635B] mt-0.5">
                  Configure category details, cover photo, and icon for storefront navigation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (!editingCategory) {
                        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    required
                    placeholder="e.g. Cold Pressed Oils"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm font-medium text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#1E382B] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="e.g. cold-pressed-oils"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm font-medium text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#1E382B] transition-colors"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Category Icon / Emoji
                  </label>
                  <div className="flex items-center gap-1">
                    {SUGGESTED_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          icon === emoji ? 'bg-[#1E382B] text-white scale-110 shadow-xs' : 'bg-stone-100 hover:bg-stone-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. 🍯"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              {/* Category Image Upload & URL Section */}
              <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E1D7]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Category Banner Image
                </label>

                {/* Live Preview if present */}
                {image && (
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          ✓ Image Ready
                        </span>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded cursor-pointer transition-colors"
                        >
                          Clear Image
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-600 font-mono truncate">
                        {image.startsWith('data:') ? 'Local Image File (Ready to upload)' : image}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload from Computer/Phone + Direct URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer bg-white hover:bg-stone-50 hover:border-[#1E382B] transition-all p-3 text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1E382B] flex items-center justify-center text-lg mb-1">
                      📷
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      Upload from Device / Phone
                    </span>
                    <span className="text-[10px] text-stone-500">
                      JPG, PNG, WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex flex-col justify-center p-3 bg-white border border-stone-300 rounded-xl space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      Or Paste Image URL
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://... or /images/..."
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#1E382B]"
                    />
                    <span className="text-[10px] text-stone-500">
                      Supports direct web links & /images/...
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Category Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of the collection for storefront display..."
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#1E382B]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#1E382B] rounded focus:ring-[#1E382B] cursor-pointer"
                />
                <label htmlFor="catActive" className="text-xs font-bold text-[#1C1917] cursor-pointer">
                  Activate Category (Visible on Customer Storefront & Catalog Filter)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D8CEBE] text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E8E1D7] shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
              Delete Category?
            </h3>
            <p className="text-sm text-[#6B635B] font-light leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1C1917] font-semibold">{categoryToDelete.name}</strong>?
              {getProductCountForCategory(categoryToDelete) > 0 && (
                <span className="block mt-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-medium">
                  ⚠️ Note: {getProductCountForCategory(categoryToDelete)} product(s) are currently associated with this category.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#D8CEBE] text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCategory}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
