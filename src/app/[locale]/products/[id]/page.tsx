import { createClient } from '@/lib/supabase/server';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductContent from './ProductContent';

export default async function ProductPage({ params: { id, locale } }: { params: { id: string, locale: string } }) {
  const supabase = createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch products of the same brand
  let { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('brand', product.brand)
    .neq('id', id)
    .limit(4);

  // If we don't have enough same-brand products, fetch other featured products
  if (!relatedProducts || relatedProducts.length < 4) {
    const { data: featuredProducts } = await supabase
      .from('products')
      .select('*')
      .neq('id', id)
      .not('id', 'in', `(${[id, ...(relatedProducts?.map(p => p.id) || [])].join(',')})`)
      .limit(4 - (relatedProducts?.length || 0));
    
    relatedProducts = [...(relatedProducts || []), ...(featuredProducts || [])];
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <ProductContent product={product} locale={locale} />

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-3xl font-black font-tajawal mb-10">
            {locale === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
