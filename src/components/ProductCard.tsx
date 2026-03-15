"use client";

import { Link } from '@/navigation';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useAppStore, currencySymbols } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  images: string[];
  brand: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const { currency, addToCart } = useAppStore();
  const name = locale === 'ar' ? product.name_ar : product.name_en;
  
  let displayPrice = product.price;
  if (currency === 'USD') displayPrice = product.price * 0.021;
  if (currency === 'SAR') displayPrice = product.price * 0.078;
  if (currency === 'EUR') displayPrice = product.price * 0.019;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      productId: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    });
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-xl hover:border-primary/50 flex flex-col h-full overflow-hidden">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full flex-grow">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary mb-4">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780&auto=format&fit=crop'}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="font-tajawal text-lg font-bold text-foreground mb-2 line-clamp-2">
            {name}
          </h3>
          <div className="mt-auto pt-4 flex items-center justify-between">
            <p className="font-cairo text-xl font-black text-primary">
              {displayPrice.toFixed(2)} {currencySymbols[currency]}
            </p>
            <Button size="icon" variant="outline" className="rounded-full shadow-lg" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
