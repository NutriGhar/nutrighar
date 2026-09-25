'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/product';
import { useContent, formatTelUrl } from '@/context/ContentContext';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const { phone, getWhatsAppUrl } = useContent();

  useEffect(() => {
    const saved = localStorage.getItem('lastOrder');
    if (saved) {
      setOrder(JSON.parse(saved));
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  const orderWhatsAppLink = getWhatsAppUrl(
    `Hi Nutri Ghar, I placed Order #${order.orderNumber}. I would like to inquire about its status.`
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your order. We've received it and will process it shortly.
          </p>

          {/* Order Number */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-2xl font-bold text-green-600 font-mono">{order.orderNumber}</p>
          </div>

          <p className="text-gray-600">
            A confirmation email has been sent to <strong>{order.email}</strong>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

          {/* Order Date */}
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="text-lg font-semibold text-gray-900">{order.date}</p>
          </div>

          {/* Items */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.name} <span className="text-gray-500 text-sm">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="mb-6 pb-6 border-b space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Charge</span>
              <span className="font-semibold">
                {order.deliveryCharge === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${order.deliveryCharge}`
                )}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total Amount</span>
            <span className="text-amber-600">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

          <div className="space-y-3 text-gray-700">
            <p className="font-semibold text-lg">{order.customerName}</p>
            <p>{order.address}</p>
            <p>
              {order.city}, {order.state} {order.pincode}
            </p>
            <p className="pt-2 text-sm">
              <span className="font-semibold">Phone:</span> {order.phone}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-blue-900 text-sm">
            <li>✓ We'll confirm your order within 2 hours</li>
            <li>✓ Your items will be freshly prepared</li>
            <li>✓ You'll receive a delivery update via SMS</li>
            <li>✓ Estimated delivery: 3-5 business days</li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-amber-900 mb-3">Have Questions?</h3>
          <p className="text-amber-900 text-sm mb-3">
            Contact us anytime - we're here to help!
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href={formatTelUrl(phone)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm"
            >
              📞 Call Us ({phone})
            </a>
            <a
              href={orderWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
