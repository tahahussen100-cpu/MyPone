"use client";

import { Link } from '@/navigation';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useAppStore, currencySymbols } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

export interface Product { id: string; name_ar: string; name_en: string; price: number; images: string[]; brand: string; }

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const { currency, addToCart } = useAppStore();
  const name = locale === 'ar' ? product.name_ar : product.name_en;
  
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary mb-4">
          <Image src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780&auto=format&fit=crop'} alt={name} fill className="object-cover" />
        </div>
        <h3 className="font-tajawal font-bold mb-2">{name}</h3>
        <p className="text-primary font-bold mt-auto">{product.price} {currencySymbols[currency]}</p>
      </Link>
    </div>
  );
}
