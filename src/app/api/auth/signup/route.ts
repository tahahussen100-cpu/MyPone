import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // ✅ بتأكد الإيميل تلقائياً
  });

  if (error) {
    // لو الحساب موجود بالفعل، نحاول نأكد إيميله
    if (error.message.includes('already registered')) {
      // نجيب اليوزر ونأكد إيميله
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === email);
      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
        });
        return NextResponse.json({ success: true, message: 'User confirmed' });
      }
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, user: data.user });
}
