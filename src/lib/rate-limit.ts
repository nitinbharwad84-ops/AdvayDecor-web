/**
 * AdvayDecor — In-Memory Rate Limiter
 * ===================================
 * Zero dependencies. Zero cost. Works on Vercel Serverless & Edge.
 *
 * Philosophy: "Generous for humans, brutal for bots."
 * A real user will NEVER hit these limits, even on a bad day.
 * A bot spamming 100 requests/sec will be stopped instantly.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store — resets on cold start (which is fine for rate limiting)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check if a request should be rate limited.
 * 
 * @param identifier - Unique key (e.g. IP + route)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { limited: boolean, remaining: number, resetIn: number }
 */
export function rateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
): { limited: boolean; remaining: number; resetIn: number } {
    cleanupExpiredEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        // First request or window expired — start fresh
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { limited: false, remaining: maxRequests - 1, resetIn: windowMs };
    }

    // Within window — increment
    entry.count += 1;

    if (entry.count > maxRequests) {
        return {
            limited: true,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    return {
        limited: false,
        remaining: maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Pre-configured rate limit profiles.
 * Each profile is tuned so a real user would NEVER be blocked.
 */
export const RATE_LIMITS = {
    // OTP endpoints: 5 requests per 60 seconds per IP
    // A real user sends 1-2 OTPs max. A bot sends hundreds.
    otp: { maxRequests: 5, windowMs: 60 * 1000 },

    // Contact form / FAQ question: 3 requests per 60 seconds
    // A real user submits 1 form. A spammer submits dozens.
    form: { maxRequests: 3, windowMs: 60 * 1000 },

    // Order placement: 5 per 60 seconds
    // Nobody places 5 orders in a minute legitimately.
    order: { maxRequests: 5, windowMs: 60 * 1000 },

    // Review submission: 5 per 60 seconds
    // A real reviewer writes carefully. A bot spams.
    review: { maxRequests: 5, windowMs: 60 * 1000 },

    // Payment: 10 per 60 seconds (generous — retries happen)
    payment: { maxRequests: 10, windowMs: 60 * 1000 },

    // Coupon validation: 10 per 60 seconds
    coupon: { maxRequests: 10, windowMs: 60 * 1000 },

    // General API: 60 per 60 seconds (very generous baseline)
    general: { maxRequests: 60, windowMs: 60 * 1000 },
};
