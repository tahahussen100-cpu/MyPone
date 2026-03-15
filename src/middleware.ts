import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
 
const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest) {
  // First run next-intl to get localized response
  const intlResponse = intlMiddleware(request);
  
  // Then pass that response to supabase middleware to update session/cookies
  // and handle route protection
  return await updateSession(request, intlResponse);
}
 
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
