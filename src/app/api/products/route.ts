import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Public API — returns only active products (uses server client with RLS, not admin client)
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                product_variants (*),
                product_images (*)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const shaped = (products || []).map((p: Record<string, unknown>) => ({
            ...p,
            variants: p.product_variants || [],
            images: p.product_images || [],
        }));

        return NextResponse.json(shaped);
    } catch (err) {
        console.error('Error fetching public products:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
