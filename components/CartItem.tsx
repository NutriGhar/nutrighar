'use client';

import { CartItem } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface CartItemComponentProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const mrpPrice = Math.round(item.price * 1.12);
  const discountPct = Math.round(((mrpPrice - item.price) / mrpPrice) * 100);
  const fallback = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 last:border-b-0">
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgError ? fallback : (item.image || fallback)}
          alt={item.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-stone-900">₹{item.price}</span>
          <span className="text-xs text-stone-400 line-through">₹{mrpPrice}</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {discountPct}% OFF
          </span>
        </div>

        {/* Quantity stepper + Remove */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-stone-300 rounded-md overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 text-base font-bold transition-colors"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-stone-900 border-x border-stone-300">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 text-base font-bold transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Item Total */}
      <div className="flex-shrink-0 text-right">
        <p className="text-base font-bold text-stone-900">₹{item.price * item.quantity}</p>
        {item.quantity > 1 && (
          <p className="text-[10px] text-stone-400 mt-0.5">₹{item.price} each</p>
        )}
      </div>
    </div>
  );
}
