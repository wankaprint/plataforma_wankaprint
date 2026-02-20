import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({ request: { headers: req.headers } });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );
                    res = NextResponse.next({ request: { headers: req.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

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
