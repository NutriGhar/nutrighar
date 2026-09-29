'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/types/content';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Registered Account' | 'Order Guest' | 'Newsletter Subscriber';
  isRegistered: boolean;
  isSubscriber: boolean;
  orderCount: number;
  totalSpent: number;
  city?: string;
  state?: string;
  createdAt: string;
  lastOrderAt?: string;
}

interface CustomerStats {
  totalCustomers: number;
  registeredCount: number;
  orderBuyersCount: number;
  subscribersCount: number;
  totalRevenue: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'registered' | 'buyers' | 'subscribers'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'spent' | 'orders'>('newest');

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [targetSegment, setTargetSegment] = useState<'all' | 'registered' | 'buyers' | 'subscribers'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Single Customer Direct Message Modal State
  const [selectedCustomerForMessage, setSelectedCustomerForMessage] = useState<CustomerItem | null>(null);
  const [directMsgSubject, setDirectMsgSubject] = useState('');
  const [directMsgBody, setDirectMsgBody] = useState('');
  const [isSendingDirectMsg, setIsSendingDirectMsg] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [custRes, prodRes] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/products'),
      ]);

      const custData = await custRes.json();
      if (custData.success && custData.data) {
        setCustomers(custData.data.customers || []);
        setStats(custData.data.stats || null);
      }

      const prodData = await prodRes.json();
      if (prodData.success && prodData.data) {
        setProducts(prodData.data || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      showToast('error', 'Failed to fetch customer records.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        if (activeFilter === 'registered' && !c.isRegistered) return false;
        if (activeFilter === 'buyers' && c.orderCount === 0) return false;
        if (activeFilter === 'subscribers' && !c.isSubscriber) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.state && c.state.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.orderCount - a.orderCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [customers, activeFilter, searchQuery, sortBy]);

  // Handle Product Selection for Broadcast
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setBroadcastSubject(`✨ New Batch Arrival: Fresh ${prod.name} at Nutri Ghar!`);
      setBroadcastHeadline(`Handcrafted With Pure A2 Ghee & Wholesome Ingredients`);
      setBroadcastMessage(
        `Dear Food Lover,\n\nWe are excited to share a brand-new artisanal batch of ${prod.name} crafted fresh in our kitchen.\n\n${prod.description}\n\nPrepared in small batches with zero preservatives, zero palm oil, and 100% pure homemade goodness. Order now to experience authentic taste delivered fresh to your doorstep.`
      );
    } else {
      setBroadcastSubject('🌿 Special Wellness Note & Fresh Kitchen Update from Nutri Ghar');
      setBroadcastHeadline('Wholesome Nutrition Crafted For Your Everyday Wellness');
      setBroadcastMessage(
        `Dear Nutri Ghar Family,\n\nWe are preparing fresh batches of homemade sweets, stone-ground peanut butters, and clean superfood snacks.\n\nVisit our store to explore our seasonal recipes and enjoy pure homemade nutrition crafted with care.`
      );
    }
  };

  // Target Recipients for Broadcast
  const targetRecipients = useMemo(() => {
    return customers.filter((c) => {
      if (!c.email || !c.email.includes('@')) return false;
      if (targetSegment === 'registered') return c.isRegistered;
      if (targetSegment === 'buyers') return c.orderCount > 0;
      if (targetSegment === 'subscribers') return c.isSubscriber;
      return true;
    });
  }, [customers, targetSegment]);

  // Send Broadcast
  const handleSendBroadcast = async () => {
    if (targetRecipients.length === 0) {
      showToast('error', 'No valid email recipients found in the selected customer segment.');
      return;
    }
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      showToast('error', 'Please fill in both the Subject and Message body.');
      return;
    }

    try {
      setIsSendingBroadcast(true);
      const res = await fetch('/api/admin/customers/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: targetRecipients.map((c) => ({ email: c.email, name: c.name })),
          subject: broadcastSubject,
          headline: broadcastHeadline,
          message: broadcastMessage,
          productId: selectedProductId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `Broadcast sent successfully to ${data.data?.sentCount || targetRecipients.length} customers!`);
        setIsBroadcastModalOpen(false);
      } else {
        showToast('error', data.error || 'Failed to send broadcast.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error occurred while broadcasting.');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Send Single Direct Email
  const handleSendDirectEmail = async () => {
    if (!selectedCustomerForMessage || !selectedCustomerForMessage.email) return;
    if (!directMsgSubject.trim() || !directMsgBody.trim()) {
      showToast('error', 'Please provide a subject and message.');
      return;
    }

    try {
      setIsSendingDirectMsg(true);
      const res = await fetch('/api/admin/customers/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [{ email: selectedCustomerForMessage.email, name: selectedCustomerForMessage.name }],
          subject: directMsgSubject,
          message: directMsgBody,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Message sent to ${selectedCustomerForMessage.email}!`);
        setSelectedCustomerForMessage(null);
        setDirectMsgSubject('');
        setDirectMsgBody('');
      } else {
        showToast('error', data.error || 'Failed to send message.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error sending message.');
    } finally {
      setIsSendingDirectMsg(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      showToast('error', 'No customers to export.');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Source', 'Registered', 'Subscriber', 'Orders Count', 'Total Spent (INR)', 'City', 'State', 'Joined Date', 'Last Order Date'];
    const rows = customers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.source}"`,
      c.isRegistered ? 'Yes' : 'No',
      c.isSubscriber ? 'Yes' : 'No',
      c.orderCount,
      c.totalSpent,
      `"${c.city || ''}"`,
      `"${c.state || ''}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
      c.lastOrderAt ? `"${new Date(c.lastOrderAt).toLocaleDateString()}"` : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nutrighar_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Customer CSV exported successfully!');
  };

  // Generate WhatsApp Direct Link
  const getWhatsAppChatUrl = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`Hi ${name}, greeting from Nutri Ghar! We hope you are enjoying your healthy homemade nutrition treats.`);
    return `https://wa.me/${fullPhone}?text=${msg}`;
  };

  // Selected product object
  const selectedProductObj = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-[#1E382B] text-white border border-[#2E5441]'
              : 'bg-red-700 text-white border border-red-800'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D49A4B] mb-2">
            <span>Customer Intelligence &amp; Outreach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#112219]">
            Customers &amp; Broadcast Hub
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl font-light">
            View all registered buyers, order customers, and newsletter subscribers. Send new product announcements and stay connected.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={() => {
              if (products.length > 0 && !selectedProductId) {
                handleSelectProduct(products[0].id);
              }
              setIsBroadcastModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#162A20] text-white text-xs font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#D49A4B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            New Product Broadcast
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Customers</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold">
              👥
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#112219] mt-3">
            {stats?.totalCustomers ?? customers.length}
          </div>
          <p className="text-xs text-stone-500 mt-1">Across accounts, orders &amp; newsletter</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Registered Accounts</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
              🔐
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#112219] mt-3">
            {stats?.registeredCount ?? customers.filter((c) => c.isRegistered).length}
          </div>
          <p className="text-xs text-stone-500 mt-1">Direct website member accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Buyers</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold">
              🛍️
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#112219] mt-3">
            {stats?.orderBuyersCount ?? customers.filter((c) => c.orderCount > 0).length}
          </div>
          <p className="text-xs text-stone-500 mt-1">Customers with 1+ orders placed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Customer Lifetime Spend</span>
            <span className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-sm font-bold">
              ₹
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#166534] mt-3">
            ₹{(stats?.totalRevenue ?? customers.reduce((sum, c) => sum + c.totalSpent, 0)).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500 mt-1">Total revenue generated</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E382B] focus:bg-white transition-all"
            />
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600 self-end md:self-auto">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E382B]"
            >
              <option value="newest">Joined Date (Newest First)</option>
              <option value="spent">Total Spent (Highest First)</option>
              <option value="orders">Orders Count (Most First)</option>
            </select>
          </div>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#112219] text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveFilter('registered')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'registered'
                ? 'bg-[#112219] text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Registered Members ({customers.filter((c) => c.isRegistered).length})
          </button>
          <button
            onClick={() => setActiveFilter('buyers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'buyers'
                ? 'bg-[#112219] text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Order Buyers ({customers.filter((c) => c.orderCount > 0).length})
          </button>
          <button
            onClick={() => setActiveFilter('subscribers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'subscribers'
                ? 'bg-[#112219] text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Subscribers ({customers.filter((c) => c.isSubscriber).length})
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
            <div className="w-8 h-8 border-3 border-[#1E382B] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading customer directory...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center text-2xl mb-3">
              🔍
            </div>
            <h3 className="text-lg font-serif font-bold text-[#112219]">No Customers Found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No customers matched your search "${searchQuery}".`
                : 'No customer records available under the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] text-[#112219] border-b border-stone-200 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                  <th className="py-3.5 px-4">Joined / Added</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((cust) => {
                  const initials = cust.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'NG';

                  return (
                    <tr key={cust.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1E382B] text-white flex items-center justify-center font-serif text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{cust.name}</span>
                              {cust.isRegistered && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Member
                                </span>
                              )}
                              {cust.isSubscriber && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Newsletter
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-500 font-light">{cust.source}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          {cust.email ? (
                            <div className="text-xs text-stone-800 font-medium">{cust.email}</div>
                          ) : (
                            <div className="text-xs text-stone-400 italic">No email</div>
                          )}
                          {cust.phone ? (
                            <div className="text-xs text-stone-600 font-mono">{cust.phone}</div>
                          ) : (
                            <div className="text-xs text-stone-400 italic">No phone</div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-stone-700">
                          {cust.city ? `${cust.city}${cust.state ? `, ${cust.state}` : ''}` : 'India'}
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            cust.orderCount > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 text-right font-bold text-stone-900">
                        {cust.totalSpent > 0 ? `₹${cust.totalSpent.toLocaleString('en-IN')}` : '—'}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs text-stone-500">
                        {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* WhatsApp Chat Button */}
                          {cust.phone && (
                            <a
                              href={getWhatsAppChatUrl(cust.phone, cust.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.158.572 4.185 1.572 5.941l-1.572 5.887 6.035-1.583c1.706.932 3.659 1.467 5.733 1.467 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                              </svg>
                            </a>
                          )}

                          {/* Direct Message Modal trigger */}
                          {cust.email && (
                            <button
                              onClick={() => {
                                setSelectedCustomerForMessage(cust);
                                setDirectMsgSubject(`Special Note from Nutri Ghar for ${cust.name}`);
                                setDirectMsgBody(`Dear ${cust.name},\n\nThank you for being a valued part of the Nutri Ghar family!\n\nWe would love to know if you have any feedback or if we can assist you with your next batch of homemade treats.\n\nWarm regards,\nNutri Ghar Kitchen`);
                              }}
                              title="Send Email Message"
                              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast & New Product Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#112219] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E382B] border border-[#2A4F3C] flex items-center justify-center text-lg">
                  📣
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    Send Customer Broadcast &amp; Product Alert
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-0.5">
                    Notify your customer base via branded email &amp; WhatsApp templates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Target Audience Segment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Target Audience ({targetRecipients.length} Recipient Emails)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'all', label: 'All Customers', count: customers.length },
                    { key: 'registered', label: 'Registered Only', count: customers.filter((c) => c.isRegistered).length },
                    { key: 'buyers', label: 'Past Buyers', count: customers.filter((c) => c.orderCount > 0).length },
                    { key: 'subscribers', label: 'Newsletter', count: customers.filter((c) => c.isSubscriber).length },
                  ].map((seg) => (
                    <button
                      key={seg.key}
                      type="button"
                      onClick={() => setTargetSegment(seg.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        targetSegment === seg.key
                          ? 'border-[#1E382B] bg-emerald-50/50 text-[#112219] ring-2 ring-[#1E382B]'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      <div className="text-xs font-bold">{seg.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{seg.count} recipients</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Product to Feature (Optional)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E382B]"
                >
                  <option value="">-- General Kitchen Broadcast (No Specific Product) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Preview Card */}
              {selectedProductObj && (
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-stone-200">
                    <Image
                      src={selectedProductObj.image}
                      alt={selectedProductObj.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase font-bold tracking-wider text-[#D49A4B]">
                      Featured In Announcement
                    </div>
                    <h4 className="font-bold text-sm text-[#112219] truncate">{selectedProductObj.name}</h4>
                    <div className="text-xs text-emerald-800 font-bold mt-0.5">₹{selectedProductObj.price}</div>
                  </div>
                </div>
              )}

              {/* Email Subject Line */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Announcement Subject Line
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Fresh Batch Arrival: Handcrafted Protein Power Ladoo!"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E382B] focus:bg-white"
                />
              </div>

              {/* Email Headline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Headline / Subheading (Optional)
                </label>
                <input
                  type="text"
                  value={broadcastHeadline}
                  onChange={(e) => setBroadcastHeadline(e.target.value)}
                  placeholder="e.g. Handcrafted With Pure A2 Desi Cow Ghee & Stone-Ground Nuts"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E382B] focus:bg-white"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Write your announcement or fresh batch notes..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E382B] focus:bg-white font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 p-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-500 text-center sm:text-left">
                Will dispatch to <strong className="text-stone-800">{targetRecipients.length} customer emails</strong>.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={isSendingBroadcast || targetRecipients.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#1E382B] hover:bg-[#162A20] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSendingBroadcast ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Broadcast</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Customer Direct Message Modal */}
      {selectedCustomerForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#112219] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Send Direct Note to {selectedCustomerForMessage.name}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">{selectedCustomerForMessage.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForMessage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={directMsgSubject}
                  onChange={(e) => setDirectMsgSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Message Body
                </label>
                <textarea
                  rows={6}
                  value={directMsgBody}
                  onChange={(e) => setDirectMsgBody(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E382B]"
                />
              </div>
            </div>

            <div className="bg-stone-50 p-5 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCustomerForMessage(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold uppercase hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDirectEmail}
                disabled={isSendingDirectMsg}
                className="px-5 py-2 rounded-xl bg-[#1E382B] text-white text-xs font-bold uppercase hover:bg-[#162A20] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSendingDirectMsg ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
