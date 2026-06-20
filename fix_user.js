const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = 'fce5b421-8b00-4c67-bf85-e5365088f7c5';
const USER_EMAIL = 'tahahussen100@gmail.com';

async function fixUser() {
  console.log('Fixing user profile and password...');

  // 1. Manually insert into public.users if missing
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .upsert({ id: USER_ID, email: USER_EMAIL, role: 'admin' });
  
  if (profileError) {
    console.error('Error updating public.users:', profileError);
  } else {
    console.log('Successfully updated public.users.');
  }

  // 2. Set password via Admin API
  const { data: user, error: authError } = await supabase.auth.admin.updateUserById(
    USER_ID,
    { password: 'AdminPassword123' }
  );

  if (authError) {
    console.error('Error updating auth password:', authError);
  } else {
    console.log('Successfully updated password in auth.users.');
  }
}

fixUser();
