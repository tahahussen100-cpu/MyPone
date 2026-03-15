import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    // Verify Admin Role securely using Service Role to bypass potential client manipulation, 
    // but first verify the JWT context mapping
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'tahahussen100@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized. Advanced features limited to tahahussen100@gmail.com' }, { status: 403 });
    }

    // Now execute SQL using Service Role (Requires Supabase pg_graphql or rpc 'exec_sql')
    // A common way to run arbitrary SQL via REST API is to create a Postgres Function 'exec_sql(query text)'
    // For this project, assuming the function exists or they will use the dashboard editor
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data, error } = await adminSupabase.rpc('exec_sql', { sql_query: query });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
