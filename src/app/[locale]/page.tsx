import { getTranslations } from 'next-intl/server';
import SliderBanner from '@/components/SliderBanner';
import ProductCard, { Product } from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const t = await getTranslations('Index');
  const supabase = createClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(8);

  const { data: moreProducts } = await supabase
    .from('products')
    .select('*')
    .range(8, 11);

  return (
    <div className="container mx-auto px-4 py-8">
      <SliderBanner />

      <section className="mb-16">
        <h2 className="text-3xl font-bold font-tajawal text-foreground mb-8 pb-2 border-b-2 border-primary inline-block">
          {t('title') === 'Welcome to My Phone' ? 'Featured Devices' : 'الأجهزة المميزة'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(featuredProducts as Product[])?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {moreProducts && moreProducts.length > 0 && (
        <section className="mb-16 pt-16 border-t border-border">
          <h2 className="text-3xl font-bold font-tajawal text-foreground mb-8 pb-2 border-b-2 border-accent inline-block">
            {t('title') === 'Welcome to My Phone' ? 'More to Explore' : 'اكتشف المزيد'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(moreProducts as Product[])?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      
      <section className="bg-secondary rounded-xl p-8 text-center mt-16 shadow-inner">
        <h3 className="text-2xl font-bold font-tajawal mb-4">
          {t('title') === 'Welcome to My Phone' ? 'Shop by Brand' : 'تسوق حسب الماركة'}
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Realme', 'Huawei', 'Other'].map(brand => (
            <span key={brand} className="px-6 py-1 bg-background border rounded-full hover:border-primary cursor-pointer transition-colors shadow-sm">
              {brand}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
