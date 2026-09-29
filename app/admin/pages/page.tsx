'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SitePage {
  id: string;
  name: string;
  path: string;
  type: 'Storefront' | 'Commerce' | 'User Account' | 'Admin & Operations';
  status: 'Live' | 'Configurable';
  description: string;
  lastUpdated: string;
  editUrl?: string;
  previewUrl: string;
}

export default function AdminPagesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const pages: SitePage[] = [
    {
      id: 'home',
      name: 'Home / Landing Page',
      path: '/',
      type: 'Storefront',
      status: 'Live',
      description: 'Hero banners, signature product spotlight, curated collections, wellness story, and customer reviews.',
      lastUpdated: 'Live & Synchronized',
      editUrl: '/admin/content',
      previewUrl: '/',
    },
    {
      id: 'shop',
      name: 'Product Shop / Catalog',
      path: '/products',
      type: 'Storefront',
      status: 'Live',
      description: 'Full store inventory listing with categories filter (Mithai, Nut Butters, Clean Protein, Roasted Snacks).',
      lastUpdated: 'Live & Synchronized',
      editUrl: '/admin/products',
      previewUrl: '/products',
    },
    {
      id: 'product-detail',
      name: 'Product Details Dynamic Page',
      path: '/products/[id]',
      type: 'Storefront',
      status: 'Live',
      description: 'Rich SKU showcase, pack size/grams, wholesome ingredients, nutritional benefits, and WhatsApp inquiry.',
      lastUpdated: 'Dynamic Database Routing',
      editUrl: '/admin/products',
      previewUrl: '/products/kaju-katli',
    },
    {
      id: 'about',
      name: 'Our Story & Brand Heritage',
      path: '/about',
      type: 'Storefront',
      status: 'Live',
      description: 'The Nutri Ghar philosophy: pure A2 cow ghee, traditional homemade methods, and zero chemical preservatives.',
      lastUpdated: 'Live & Synchronized',
      editUrl: '/admin/content',
      previewUrl: '/about',
    },
    {
      id: 'contact',
      name: 'Contact & Artisanal Kitchen',
      path: '/contact',
      type: 'Storefront',
      status: 'Live',
      description: 'Gurugram artisanal kitchen address, customer care helpline (+91 79761 19153), and inquiry form.',
      lastUpdated: 'Live & Synchronized',
      editUrl: '/admin/content',
      previewUrl: '/contact',
    },
    {
      id: 'cart',
      name: 'Shopping Cart',
      path: '/cart',
      type: 'Commerce',
      status: 'Live',
      description: 'Interactive slide-out basket & full cart page with pack size breakdown, total pricing, and WhatsApp order.',
      lastUpdated: 'Live Cart Context',
      previewUrl: '/cart',
    },
    {
      id: 'checkout',
      name: 'Direct Order Checkout',
      path: '/checkout',
      type: 'Commerce',
      status: 'Live',
      description: 'Shipping address collection, COD & UPI payment support, and live order placement into database.',
      lastUpdated: 'Live Checkout Flow',
      previewUrl: '/checkout',
    },
    {
      id: 'login',
      name: 'Customer Login',
      path: '/login',
      type: 'User Account',
      status: 'Live',
      description: 'Customer account authentication and WhatsApp mobile verification gateway.',
      lastUpdated: 'Live Auth System',
      previewUrl: '/login',
    },
    {
      id: 'register',
      name: 'Customer Registration',
      path: '/register',
      type: 'User Account',
      status: 'Live',
      description: 'New user sign-up with email, phone, and welcome coupon rewards.',
      lastUpdated: 'Live Auth System',
      previewUrl: '/register',
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      path: '/admin',
      type: 'Admin & Operations',
      status: 'Configurable',
      description: 'Store revenue metrics, pending orders, inventory alerts, and quick actions.',
      lastUpdated: 'Secured Admin Session',
      editUrl: '/admin',
      previewUrl: '/admin',
    },
    {
      id: 'admin-products',
      name: 'Product Catalog Manager',
      path: '/admin/products',
      type: 'Admin & Operations',
      status: 'Configurable',
      description: 'Add new SKUs, edit pricing, weight (gm/kg), stock quantity, and bestseller badges.',
      lastUpdated: 'Secured Admin Session',
      editUrl: '/admin/products',
      previewUrl: '/admin/products',
    },
    {
      id: 'admin-orders',
      name: 'Customer Orders Manager',
      path: '/admin/orders',
      type: 'Admin & Operations',
      status: 'Configurable',
      description: 'View orders, update dispatch/shipped status, and customer shipping details.',
      lastUpdated: 'Secured Admin Session',
      editUrl: '/admin/orders',
      previewUrl: '/admin/orders',
    },
    {
      id: 'admin-customers',
      name: 'Customers & WhatsApp Broadcast',
      path: '/admin/customers',
      type: 'Admin & Operations',
      status: 'Configurable',
      description: 'Customer contact directory, total spend, order history, and WhatsApp broadcast notification generator.',
      lastUpdated: 'Secured Admin Session',
      editUrl: '/admin/customers',
      previewUrl: '/admin/customers',
    },
    {
      id: 'admin-content',
      name: 'Website Content & Banner Editor',
      path: '/admin/content',
      type: 'Admin & Operations',
      status: 'Configurable',
      description: 'Edit homepage hero slides, headlines, story text, announcement banners, and contact information.',
      lastUpdated: 'Secured Admin Session',
      editUrl: '/admin/content',
      previewUrl: '/admin/content',
    },
  ];

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9C5838] font-bold block mb-1">
            Site Architecture
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Website Pages & Route Directory
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Overview of all active storefront routes, commerce funnels, and administrative management portals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-5 py-3 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm inline-flex items-center justify-center gap-2"
          >
            <span>Open Live Website</span>
            <span>↗</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E1D7] shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B635B] mb-1.5">
            Search Pages
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by page name, route path, description..."
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1E382B]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B635B] mb-1.5">
            Section Category
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:border-[#1E382B]"
          >
            <option value="all">All Page Types ({pages.length})</option>
            <option value="Storefront">Storefront Pages</option>
            <option value="Commerce">Commerce & Checkout</option>
            <option value="User Account">Customer Account & Auth</option>
            <option value="Admin & Operations">Admin & Management</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E1D7] text-[11px] uppercase tracking-wider text-[#6B635B] font-semibold">
              <tr>
                <th className="py-3.5 px-6">Page Name & Route</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7]/60">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  {/* Name & Route */}
                  <td className="py-4 px-6">
                    <div className="font-serif font-semibold text-[#1C1917]">
                      {page.name}
                    </div>
                    <div className="text-xs text-stone-500 font-mono mt-0.5 inline-block bg-stone-100 px-2 py-0.5 rounded">
                      {page.path}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <span className="inline-block bg-[#EFE8DE] text-[#1E382B] px-2.5 py-1 rounded-full text-xs font-semibold">
                      {page.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{page.status}</span>
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-4 px-6 text-xs text-[#6B635B] max-w-sm">
                    {page.description}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    {page.editUrl && (
                      <Link
                        href={page.editUrl}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-semibold text-[#1C1917] transition-colors"
                      >
                        Manage
                      </Link>
                    )}
                    <Link
                      href={page.previewUrl}
                      target={page.previewUrl.startsWith('/admin') ? '_self' : '_blank'}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1E382B] hover:bg-[#2A4F3C] text-xs font-semibold text-white transition-colors gap-1"
                    >
                      <span>View</span>
                      <span>↗</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
