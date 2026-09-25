'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category } from '@/lib/db';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories?all=true'),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Failed to load products:', err);
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

  // Toggle active status
  const handleToggleStatus = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
        );
        showToast(`Product marked as ${!product.isActive ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product confirmation
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        showToast('Product successfully deleted');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory || p.categorySlug === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'active') matchesStatus = p.isActive;
    if (selectedStatus === 'inactive') matchesStatus = !p.isActive;
    if (selectedStatus === 'low-stock') matchesStatus = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
    if (selectedStatus === 'out-of-stock') matchesStatus = p.stockQuantity === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            Inventory & Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Product Management
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Manage products, pricing, stock levels, categories, and storefront visibility.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm inline-flex items-center justify-center gap-2"
        >
          <span>+ Add New Product</span>
        </Link>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E1D7] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B635B] mb-1.5">
            Search Products
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, slug, description..."
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1E382B]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B635B] mb-1.5">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status / Stock Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B635B] mb-1.5">
            Stock & Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
          >
            <option value="all">All Statuses ({products.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low-stock">⚠️ Low Stock Alerts</option>
            <option value="out-of-stock">🚫 Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-[#E8E1D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E1D7] text-[11px] uppercase tracking-wider text-[#6B635B] font-semibold">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-stone-500 font-light">
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isLowStock = product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0;
                  const isOutOfStock = product.stockQuantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#EFE8DE] relative overflow-hidden flex-shrink-0 border border-[#E8E1D7]">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <div className="font-serif font-semibold text-[#1C1917]">
                              {product.name}
                            </div>
                            <div className="text-xs text-stone-500 font-mono">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-medium text-[#6B635B] capitalize">
                        {product.categorySlug.replace('-', ' ')}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div className="font-serif font-bold text-[#1E382B]">
                          ₹{product.price}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-[11px] text-stone-400 line-through">
                            ₹{product.originalPrice}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-600' : isLowStock ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                          <span>{product.stockQuantity} units</span>
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            product.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {product.isActive ? '● Active' : '○ Inactive'}
                        </button>
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-4 text-xs space-y-1">
                        {product.isFeatured && (
                          <span className="inline-block bg-[#EFE8DE] text-[#9C5838] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-1">
                            Featured
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            Bestseller
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-semibold text-[#1C1917] transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-stone-500 font-light">
                    No products matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E8E1D7] shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
              Delete Product?
            </h3>
            <p className="text-sm text-[#6B635B] font-light leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1C1917] font-semibold">{productToDelete.name}</strong>? This action will remove the item from the catalog.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#D8CEBE] text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
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
