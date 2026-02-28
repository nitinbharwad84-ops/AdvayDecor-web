import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('wishlists')
            .select(`
                id,
                created_at,
                product:products (
                    id, title, slug, base_price, category, images:product_images(image_url)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { product_id } = await request.json();

        if (!product_id) {
            return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if already in wishlist
        const { data: existing } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', product_id)
            .maybeSingle();

        if (existing) {
            // If exists, remove it (toggle behavior)
            const { error: deleteError } = await supabase
                .from('wishlists')
                .delete()
                .eq('id', existing.id);

            if (deleteError) throw deleteError;
            return NextResponse.json({ success: true, action: 'removed' });
        }

        // Otherwise insert it
        const { error: insertError } = await supabase
            .from('wishlists')
            .insert({
                user_id: user.id,
                product_id: product_id
            });

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, action: 'added' });
    } catch (error: any) {
        console.error('Error toggling wishlist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
