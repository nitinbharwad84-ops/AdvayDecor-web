import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache the admin client instance to prevent multiple instantiations in serverless environments
let adminClient: SupabaseClient | null = null;

// Admin client with service role key — only use server-side (API routes)
// This bypasses RLS and has full access
export function createAdminClient() {
    if (adminClient) return adminClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}
