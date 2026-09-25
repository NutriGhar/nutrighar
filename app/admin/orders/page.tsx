'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/db';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const url = selectedStatus === 'All' ? '/api/orders' : `/api/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        showToast(`Order status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status: string) => {
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

  const statusTabs = ['All', 'Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];

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
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-tight font-normal">
            Customer Orders
          </h1>
          <p className="text-sm text-[#6B635B] font-light mt-1">
            Track kitchen preparation, courier dispatches, and update fulfillment milestones.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 bg-white hover:bg-[#EFE8DE] text-[#1E382B] rounded-xl border border-[#D8CEBE] transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
        >
          <span>↻ Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === tab
                  ? 'bg-[#1E382B] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#6B635B] hover:bg-[#EFE8DE] border border-[#E8E1D7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order Number (NG...), Customer Name, Phone, or Email..."
            className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1E382B]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E1D7] text-[11px] uppercase tracking-wider text-[#6B635B] font-semibold">
              <tr>
                <th className="py-3.5 px-6">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-stone-500 font-light">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-[#1E382B]">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-stone-500 font-light mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1C1917]">{order.customerName}</div>
                      <div className="text-xs text-stone-500 font-light">{order.customerPhone}</div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4 text-xs text-stone-700 max-w-xs truncate">
                      {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>

                    {/* Total */}
                    <td className="py-4 px-4 font-serif font-bold text-[#1C1917]">
                      ₹{order.totalAmount}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status Select */}
                    <td className="py-4 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value as Order['orderStatus'])
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadgeClass(
                          order.orderStatus
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DE] border border-[#D8CEBE] text-xs font-semibold text-[#1E382B] transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-stone-500 font-light">
                    No orders matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E1D7] shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#9C5838] uppercase">
                  ORDER DETAILS
                </span>
                <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Status Update Strip */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 font-medium block">Current Fulfillment Status</span>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1C1917]">Change Status:</span>
                <select
                  value={selectedOrder.orderStatus}
                  disabled={isUpdatingStatus}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.id, e.target.value as Order['orderStatus'])
                  }
                  className="px-3 py-1.5 bg-white border border-[#D8CEBE] rounded-xl text-xs font-semibold text-[#1C1917] focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7]">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9C5838] mb-2">
                  Customer Info
                </h4>
                <div className="text-sm font-semibold text-[#1C1917]">
                  {selectedOrder.customerName}
                </div>
                <div className="text-xs text-stone-600 mt-1">{selectedOrder.customerPhone}</div>
                <div className="text-xs text-stone-600">{selectedOrder.customerEmail}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9C5838] mb-2">
                  Shipping Address
                </h4>
                <div className="text-xs text-stone-700 leading-relaxed font-light">
                  {selectedOrder.addressLine1}
                  {selectedOrder.addressLine2 && <>, {selectedOrder.addressLine2}</>}
                  <br />
                  {selectedOrder.city}, {selectedOrder.state} — {selectedOrder.postalCode}
                </div>
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9C5838]">
                Ordered Products
              </h4>
              <div className="divide-y divide-[#E8E1D7] border border-[#E8E1D7] rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-[#FAF7F2] transition-colors">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <div className="w-10 h-10 rounded-lg relative overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-xs text-[#1C1917]">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-stone-500 font-light">
                          ₹{item.productPrice} × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-serif font-bold text-xs text-[#1E382B]">
                      ₹{item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D7] space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between font-serif text-base font-bold text-[#1C1917] pt-2 border-t border-[#E8E1D7]">
                <span>Total Amount</span>
                <span className="text-[#1E382B]">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1E382B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2A4F3C] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
