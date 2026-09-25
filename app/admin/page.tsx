'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    image: string;
    stockQuantity: number;
    lowStockThreshold: number;
    price: number;
    categorySlug: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{ productName: string; quantity: number }>;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9C5838] font-bold block mb-1">
            Store Overview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Business Dashboard
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Real-time sales, order fulfillment, and kitchen inventory updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-white hover:bg-[#EFE8DE] text-[#1E382B] rounded-xl border border-[#D8CEBE] transition-colors shadow-sm"
            title="Refresh Data"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#2A4F3C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#6B635B]">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#1E382B]">
            ₹{stats?.totalRevenue.toLocaleString('en-IN') || '0'}
          </div>
          <p className="text-xs text-stone-500 font-light mt-1">
            From {stats?.totalOrders || 0} completed orders
          </p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#6B635B]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#1C1917]">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-xs text-stone-500 font-light mt-1">
            {stats?.deliveredOrders || 0} successfully delivered
          </p>
        </div>

        {/* Metric 3: Pending Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#6B635B]">
              Pending Fulfillment
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#9C5838]">
            {stats?.pendingOrders || 0}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            Requires kitchen dispatch
          </p>
        </div>

        {/* Metric 4: Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E1D7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#6B635B]">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#1C1917]">
            {stats?.activeProducts || 0}
          </div>
          <p className="text-xs text-stone-500 font-light mt-1">
            Out of {stats?.totalProducts || 0} total SKUs
          </p>
        </div>

      </div>

      {/* Main Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 cols: Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#1C1917] font-semibold">
                Recent Orders
              </h2>
              <p className="text-xs text-[#6B635B] font-light mt-0.5">
                Latest customer orders awaiting fulfillment
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold uppercase tracking-wider text-[#1E382B] hover:text-[#9C5838] transition-colors"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E8E1D7] text-[11px] uppercase tracking-wider text-[#6B635B] font-semibold">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D7]/60">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-4 font-mono text-xs font-bold text-[#1E382B]">
                        {order.orderNumber}
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-[#1C1917]">{order.customerName}</div>
                        <div className="text-xs text-stone-500 font-light">{order.customerPhone}</div>
                      </td>
                      <td className="py-4 text-xs text-stone-600">
                        {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-4 font-serif font-bold text-[#1C1917]">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-xs text-[#1E382B] hover:text-[#9C5838] font-semibold"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-stone-500">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 cols: Low Stock Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                  Low Stock Inventory
                </h3>
              </div>
              <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {stats?.lowStockProducts.length || 0} Alerts
              </span>
            </div>

            <div className="space-y-3">
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#EFE8DE] relative overflow-hidden flex-shrink-0">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#1C1917] line-clamp-1">
                          {prod.name}
                        </h4>
                        <span className="text-[11px] text-rose-600 font-bold">
                          Only {prod.stockQuantity} left (Min: {prod.lowStockThreshold})
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/products/${prod.id}/edit`}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 text-xs font-semibold text-[#1E382B] rounded-lg border border-[#D8CEBE] transition-colors flex-shrink-0"
                    >
                      Restock
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-stone-500 font-light">
                  ✓ All active products have sufficient inventory.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8E1D7] space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#1C1917] mb-2">
              Quick Shortcuts
            </h3>
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-medium text-[#1C1917] transition-colors"
            >
              <span>➕ Add New Product SKU</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-medium text-[#1C1917] transition-colors"
            >
              <span>📂 Manage Categories</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/content"
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-medium text-[#1C1917] transition-colors"
            >
              <span>📝 Update Homepage Copy & Hero</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
