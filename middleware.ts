import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();

    // Protect /admin-orders route
    if (req.nextUrl.pathname.startsWith('/admin-orders')) {
        if (!session) {
            // Redirect to login if not authenticated
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = '/login';
            return NextResponse.redirect(redirectUrl);
        }
    }

    return res;
}

export const config = {
    matcher: ['/admin-orders/:path*']
};
