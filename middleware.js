import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // questo legge la sessione dai cookie httpOnly e, se necessario, li aggiorna
  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
