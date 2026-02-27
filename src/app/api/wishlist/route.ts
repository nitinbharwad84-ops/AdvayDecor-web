import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Fetch user's wishlist
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data: wishlist, error } = await supabase
            .from('wishlists')
            .select('product_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            items: (wishlist || []).map(w => w.product_id),
        });
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add item to wishlist
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { product_id } = await request.json();
        if (!product_id) {
            return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id });

        if (error) {
            if (error.code === '23505') {
                // Already in wishlist — not an error
                return NextResponse.json({ success: true, message: 'Already in wishlist' });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Remove item from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');
        if (!productId) {
            return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
