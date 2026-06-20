const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('Checking public.users table...');
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users in public.users:', data);
  }

  console.log('\nChecking auth.users (via admin API)...');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    console.log('Users in auth.users:', users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })));
  }
}

checkUsers();
