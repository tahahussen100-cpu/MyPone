"use client";

import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function ProductsPage() {
  const locale = useLocale();
  const t = useTranslations('Common'); // Fallback to Home translations or generic
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useAppStore();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      productId: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1
    });
    alert(locale === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 font-tajawal">
        <h1 className="text-4xl font-bold text-primary">
          {locale === 'ar' ? 'جميع المنتجات' : 'All Products'}
        </h1>
        <p className="text-muted-foreground">
          {products.length} {locale === 'ar' ? 'منتج متاح' : 'products available'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse"></div>
          ))
        ) : products.map((product) => (
          <div key={product.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="relative aspect-square overflow-hidden bg-secondary/30 text-center flex items-center justify-center">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={locale === 'ar' ? product.name_ar : product.name_en}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="text-muted-foreground">No Image</div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  {product.brand}
                </span>
              </div>
              <button className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-md rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart size={18} />
              </button>
            </div>
            
            <div className="p-6 font-cairo text-right" dir="rtl">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {locale === 'ar' ? product.name_ar : product.name_en}
              </h3>
              <p className="text-2xl font-black text-primary mb-4">
                {product.price.toLocaleString()} ج.م
              </p>
              
              <div className="flex gap-2">
                <Button 
                variant="outline" 
                className="w-full gap-2 rounded-xl"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart size={16} />
                {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
              </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
