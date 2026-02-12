// components/ShopProductCard.tsx - ÜRÜN KARTI
'use client';

import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';

interface ShopProductCardProps {
  product: any;
}

export default function ShopProductCard({ product }: ShopProductCardProps) {
  return (
    <Link 
      href={`/product/${product.id}`} // BURASI DEĞİŞTİ
      className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden block"
    >
      {/* Resim */}
      {product.images && product.images.length > 0 ? (
        <div className="h-48 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400">Resim Yok</div>
        </div>
      )}
      
      {/* İçerik */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-blue-600">
            {product.price.toLocaleString('tr-TR')} {product.price_currency}
          </span>
          {product.discount_percent && (
            <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
              %{product.discount_percent} indirim
            </span>
          )}
        </div>
        
        {/* Alt Bilgi */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            {product.view_count || 0}
          </div>
          <div className="flex items-center">
            <Heart size={14} className="mr-1" />
            {product.wishlist_count || 0}
          </div>
        </div>
      </div>
    </Link>
  );
}