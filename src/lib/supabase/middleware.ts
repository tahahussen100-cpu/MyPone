import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
    const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
              cookies: {
                        get(name: string) {
                                    return request.cookies.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                                    request.cookies.set({ name, value, ...options });
                                    response.cookies.set({ name, value, ...options });
                        },
                        remove(name: string, options: CookieOptions) {
                                    request.cookies.set({ name, value: '', ...options });
                                    response.cookies.set({ name, value: '', ...options });
                        },
              },
      }
        );

  const { data } = await supabase.auth.getUser();
    const user = data?.user;

  // Basic admin protection logic
  const pathname = request.nextUrl.pathname;
    if (pathname.includes('/admin')) {
          if (!user) {
                  return NextResponse.redirect(new URL('/login', request.url));
          }
          // Fetch user role
      const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

      if (!profile || profile.role !== 'admin') {
              return NextResponse.redirect(new URL('/', request.url));
      }
    }

  return response;
}
