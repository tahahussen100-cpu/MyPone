const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function reset() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const email = 'tahahussen100@gmail.com';
  const newPassword = 't@h@2020'; // New requested password
  
  let user = users.users.find(u => u.email === email);
  
  if (user) {
    console.log('User found. Updating password...');
    const { data, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true,
    });
    console.log(updateErr ? ('Error updating:', updateErr) : 'Password updated successfully to ' + newPassword);
  } else {
    console.log('User not found.');
  }
}

reset();
