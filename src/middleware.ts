import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// ============================================================
// Rate Limit Route Configuration
// ============================================================
// Maps URL patterns to rate limit profiles.
// Only POST/PUT/DELETE methods are limited — GET requests are never blocked.
// Limits are VERY generous so real customers are never affected.
// ============================================================
const RATE_LIMITED_ROUTES: { pattern: string; profile: keyof typeof RATE_LIMITS }[] = [
    // OTP / Auth — most targeted by bots
    { pattern: '/api/auth/otp', profile: 'otp' },

    // Forms — spam prevention
    { pattern: '/api/contact', profile: 'form' },
    { pattern: '/api/faq/question', profile: 'form' },

    // Orders — prevent automated order flooding
    { pattern: '/api/orders', profile: 'order' },

    // Reviews — prevent review spam
    { pattern: '/api/reviews', profile: 'review' },

    // Payments — generous (retries are normal)
    { pattern: '/api/razorpay', profile: 'payment' },

    // Coupons — prevent brute-force coupon guessing
    { pattern: '/api/coupons', profile: 'coupon' },
];

function getClientIP(request: NextRequest): string {
    // Vercel provides the real IP via this header
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

export async function middleware(request: NextRequest) {
    // ==============================
    // 1. Rate Limiting (POST only)
    // ==============================
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
        const pathname = request.nextUrl.pathname;

        // Exempt the Razorpay webhook — it's called by Razorpay's servers, not users
        if (pathname !== '/api/razorpay/webhook') {
            const matchedRoute = RATE_LIMITED_ROUTES.find((r) => pathname.startsWith(r.pattern));

            if (matchedRoute) {
                const ip = getClientIP(request);
                const { profile } = matchedRoute;
                const config = RATE_LIMITS[profile];
                const identifier = `${ip}:${matchedRoute.pattern}`;

                // Optimized O(1) rate limiting check (Redis + In-Memory Fallback)
                const result = await rateLimit(identifier, config.maxRequests, config.windowMs);

                if (result.limited) {
                    console.warn(`Rate limit hit: ${ip} on ${pathname} (profile: ${profile})`);
                    return NextResponse.json(
                        {
                            error: 'Too many requests. Please wait a moment and try again.',
                        },
                        {
                            status: 429,
                            headers: {
                                'Retry-After': String(Math.ceil(result.resetIn / 1000)),
                                'X-RateLimit-Remaining': '0',
                            },
                        }
                    );
                }
            }
        }
    }

    // ==============================
    // 2. Supabase Auth (existing)
    // ==============================
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Refresh session (keeps Supabase auth cookies alive)
    await supabase.auth.getUser();

    // Admin routes are protected client-side via useAdminAuthStore in admin/layout.tsx
    // No server-side redirect needed — the admin layout handles auth guard

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
