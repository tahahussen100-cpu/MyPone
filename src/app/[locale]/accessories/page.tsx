"use client";

import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AccessoriesPage() {
  const locale = useLocale();
  const supabase = createClient();
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useAppStore();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      productId: item.id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price,
      image: item.image || '',
      quantity: 1
    });
    alert(locale === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!');
  };

  useEffect(() => {
    const fetchAccessories = async () => {
      const { data } = await supabase.from('accessories').select('*');
      if (data) setAccessories(data);
      setLoading(false);
    };
    fetchAccessories();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12 font-tajawal">
        <h1 className="text-4xl font-bold text-primary mb-4">
          {locale === 'ar' ? 'الإكسسوارات والمستلزمات' : 'Accessories & Supplies'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'أفضل الملحقات الأصلية لأجهزتك المفضلة' : 'Best genuine accessories for your favorite devices'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-[300px] animate-pulse"></div>
          ))
        ) : accessories.map((item) => (
          <div key={item.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all">
            <div className="relative aspect-square bg-secondary/30 flex items-center justify-center p-8">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={locale === 'ar' ? item.name_ar : item.name_en}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground">No Image</div>
              )}
            </div>
            
            <div className="p-6 font-cairo text-right" dir="rtl">
              <h3 className="font-bold mb-2">
                {locale === 'ar' ? item.name_ar : item.name_en}
              </h3>
              <p className="text-xl font-bold text-primary mb-4">
                {item.price.toLocaleString()} ج.م
              </p>
              <Button 
                variant="outline" 
                className="w-full gap-2 rounded-xl"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart size={16} />
                {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && accessories.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-cairo">
          {locale === 'ar' ? 'لا يوجد إكسسوارات متاحة حالياً.' : 'No accessories available yet.'}
        </div>
      )}
    </div>
  );
}
