'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useContent } from '@/context/ContentContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface ProductWhatsAppInquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'I have a question about this product.',
  'Is this available for immediate delivery?',
  'Can I order this in bulk / customized pack?',
  'What is the shelf life and ingredients?',
  'Do you deliver this to my location?',
];

export default function ProductWhatsAppInquiryModal({
  product,
  isOpen,
  onClose,
}: ProductWhatsAppInquiryModalProps) {
  const { getWhatsAppUrl } = useContent();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [selectedQuery, setSelectedQuery] = useState(QUICK_QUESTIONS[0]);

  if (!isOpen) return null;

  const handleSend = (customQuery?: string) => {
    const activeQuery = customQuery || selectedQuery || 'I have a question about this product.';

    // Greeting with automatic customer name if logged in
    const customerGreeting = isAuthenticated && customer?.name
      ? `Hi, I am ${customer.name}. `
      : 'Hi Nutri Ghar Admin, ';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nutrighar.com';
    const productUrl = `${origin}/products/${product.id || product.slug}`;

    // Note: In WhatsApp, placing a URL completely on its own line (with blank lines around it)
    // ensures WhatsApp renders it as a direct clickable hyperlink with card preview.
    const messageLines = [
      '🌿 *NUTRI GHAR PRODUCT INQUIRY* 🌿',
      '',
      `${customerGreeting}I am interested in this product:`,
      `📦 *${product.name}* (₹${product.price})`,
      '',
      '🔗 *Product Link:*',
      productUrl,
      '',
      `❓ *My Query:*`,
      `"${activeQuery}"`,
      '',
      'Please assist me with this inquiry. Thank you!',
    ];

    const fullMessage = messageLines.join('\n');
    const waUrl = getWhatsAppUrl(fullMessage);

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E382B] text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center text-sm shadow-xs font-bold">
              💬
            </span>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-semibold tracking-wide">
                Chat with Admin on WhatsApp
              </h3>
              <p className="text-[11px] text-stone-300 font-light">
                {isAuthenticated && customer?.name
                  ? `Inquiring as ${customer.name}`
                  : 'Quick direct product inquiry'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Product Image & Info Preview */}
        <div className="p-4 bg-[#FAF7F2] border-b border-stone-200 flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#EBE2D5] border border-stone-300 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-semibold text-stone-900 text-sm truncate">
              {product.name}
            </h4>
            <div className="font-serif font-bold text-[#1E382B] text-sm mt-0.5">
              ₹{product.price}
            </div>
          </div>
        </div>

        {/* Query selection */}
        <div className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Select or tap your query:
            </label>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedQuery(q);
                    handleSend(q);
                  }}
                  className={`w-full text-xs p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedQuery === q
                      ? 'bg-emerald-50 border-[#25D366] text-[#1E382B] font-semibold'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  <span>{q}</span>
                  <span className="text-[#25D366] text-sm font-bold">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSend()}
              className="w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>💬 Open WhatsApp Chat</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
