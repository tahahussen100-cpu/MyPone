const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .upsert([
      { name_ar: 'هواتف ذكية', name_en: 'Smartphones', slug: 'smartphones' },
      { name_ar: 'إكسسوارات', name_en: 'Accessories', slug: 'accessories' },
      { name_ar: 'أجهزة لوحية', name_en: 'Tablets', slug: 'tablets' }
    ])
    .select();

  if (catError) {
    console.error('Error seeding categories:', catError);
    return;
  }

  const phoneCatId = categories.find(c => c.slug === 'smartphones').id;

  console.log('Seeding products...');
  const { error: prodError } = await supabase
    .from('products')
    .upsert([
      {
        category_id: phoneCatId,
        name_ar: 'آيفون 15 برو',
        name_en: 'iPhone 15 Pro',
        description_ar: 'أحدث هاتف من أبل مع معالج A17 Pro وكاميرا احترافية.',
        description_en: 'The latest iPhone with A17 Pro chip and pro camera system.',
        brand: 'Apple',
        price: 55000,
        images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2000&auto=format&fit=crop']
      },
      {
        category_id: phoneCatId,
        name_ar: 'سامسونج S24 الترا',
        name_en: 'Samsung S24 Ultra',
        description_ar: 'هاتف سامسونج الرائد مع شاشة مبهرة وقلم S-Pen.',
        description_en: 'Samsung flagship with stunning display and S-Pen.',
        brand: 'Samsung',
        price: 52000,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop']
      }
    ]);

  if (prodError) {
    console.error('Error seeding products:', prodError);
  } else {
    console.log('Seeding completed successfully!');
  }
}

seed();
