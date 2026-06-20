const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  console.log('Setting up Supabase Storage...');
  
  const { data, error } = await supabase.storage.createBucket('products', {
    public: true,
    fileSizeLimit: 1024 * 1024 * 5, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });

  if (error) {
    if (error.message === 'The bucket already exists') {
      console.log('Bucket "products" already exists.');
    } else {
      console.error('Error creating bucket:', error);
    }
  } else {
    console.log('Bucket "products" created successfully.');
  }
}

setupStorage();
