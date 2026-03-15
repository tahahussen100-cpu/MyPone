"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAppStore, currencySymbols } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';

export default function ProductContent({ product, locale }: { product: any, locale: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const { currency, addToCart } = useAppStore();
  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const description = locale === 'ar' ? product.description_ar : product.description_en;
  const images = product.images || [];

  let displayPrice = product.price;
  if (currency === 'USD') displayPrice = product.price * 0.021;
  if (currency === 'SAR') displayPrice = product.price * 0.078;
  if (currency === 'EUR') displayPrice = product.price * 0.019;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      productId: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      image: images[0] || '',
      quantity: 1,
    });
    alert(locale === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Gallery Section */}
      <div className="space-y-6">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary shadow-2xl border border-border">
          <Image
            src={images[activeImage] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 hover:scale-110"
            priority
          />
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
                onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
                onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
              >
                <ChevronRight size={24} />
              </Button>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === idx ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`${name} ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" className="opacity-30" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-tajawal mb-6 leading-tight">
            {name}
          </h1>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-black text-primary font-cairo">
              {displayPrice.toFixed(2)} {currencySymbols[currency]}
            </span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed font-cairo border-r-4 border-primary/20 pr-6">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button size="lg" className="h-16 rounded-2xl text-xl font-bold gap-3 shadow-2xl shadow-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500" onClick={handleAddToCart}>
            <ShoppingCart size={24} />
            {locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
          </Button>
        </div>

        {/* Pros and Cons Section */}
        {((product.specs?.pros?.[locale]?.length > 0) || (product.specs?.cons?.[locale]?.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            {/* Pros */}
            {product.specs?.pros?.[locale]?.length > 0 && (
              <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 space-y-4">
                <div className="flex items-center gap-3 text-green-600 mb-2">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold font-tajawal text-lg">
                    {locale === 'ar' ? 'المميزات' : 'Pros'}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {product.specs.pros[locale].map((pro: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80 font-cairo">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {product.specs?.cons?.[locale]?.length > 0 && (
              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                <div className="flex items-center gap-3 text-red-600 mb-2">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <XCircle size={20} />
                  </div>
                  <h3 className="font-bold font-tajawal text-lg">
                    {locale === 'ar' ? 'العيوب' : 'Cons'}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {product.specs.cons[locale].map((con: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80 font-cairo">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technical Specs */}
        {product.specs && Object.keys(product.specs).some(k => k !== 'pros' && k !== 'cons') && (
          <div className="pt-8 border-t border-border">
            <h3 className="text-xl font-bold font-tajawal mb-6">
              {locale === 'ar' ? 'المواصفات التقنية' : 'Technical Specifications'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => {
                if (key === 'pros' || key === 'cons') return null;
                return (
                  <div key={key} className="flex flex-col p-4 rounded-2xl bg-secondary/30 border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 opacity-60 font-tajawal">
                      {key}
                    </span>
                    <span className="font-bold text-foreground font-cairo">
                      {value as string}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">{locale === 'ar' ? 'ضمان عام كامل' : '1-Year Warranty'}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'ضمان الوكيل المعتمد' : 'Official agent warranty'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">{locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'خلال ٢٤ ساعة في القاهرة' : 'Within 24h in Cairo'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
