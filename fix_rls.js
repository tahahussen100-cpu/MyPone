const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  console.log('Fixing RLS for repair_orders...');
  
  // Note: We can't run raw SQL via the client unless we have a custom RPC.
  // We'll try to just update the policy if we can, but usually this needs SQL Editor.
  // However, I can try to use the 'pg' extension if I had it, but I don't.
  // I will assume the user can run it in the SQL Editor if this script fails to find an RPC.
  
  console.log('Since I cannot run raw SQL directly without an RPC, I will provide the command for you to run in the Supabase SQL Editor if needed.');
  console.log('BUT I will try one more thing: checking if there is an existing exec_sql function.');

  const { data, error } = await supabase.rpc('exec_sql', { 
    sql_string: `
      DROP POLICY IF EXISTS "Users can create repairs" ON public.repair_orders;
      CREATE POLICY "Anyone can create repairs" ON public.repair_orders 
      FOR INSERT WITH CHECK (true);
    ` 
  });

  if (error) {
    console.log('--------------------------------------------------');
    console.log('ACTION REQUIRED: Please copy and run this in your Supabase SQL Editor:');
    console.log('');
    console.log('DROP POLICY IF EXISTS "Users can create repairs" ON public.repair_orders;');
    console.log('CREATE POLICY "Anyone can create repairs" ON public.repair_orders FOR INSERT WITH CHECK (true);');
    console.log('--------------------------------------------------');
  } else {
    console.log('RLS fixed successfully via RPC.');
  }
}

fixRLS();
