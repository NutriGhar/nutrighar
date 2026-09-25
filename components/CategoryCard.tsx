'use client';

import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export default function CategoryCard({ id, name, icon, description }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${id}`}
      className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-orange-300 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 bg-white"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative space-y-4">
        <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300 inline-block">
          {icon}
        </div>
        <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
            {description}
          </p>
        )}
        <p className="text-sm font-semibold text-orange-600 group-hover:text-orange-700 flex items-center justify-center gap-2">
          Shop now
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </p>
      </div>
    </Link>
  );
}
