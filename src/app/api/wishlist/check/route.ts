import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const productId = url.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ isWishlisted: false });
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ isWishlisted: false });
        }

        const { data: existing, error } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (error) {
            console.error('Error checking wishlist:', error);
            return NextResponse.json({ isWishlisted: false });
        }

        // Return strictly boolean
        return NextResponse.json({ isWishlisted: !!existing });
    } catch (error: any) {
        console.error('Error in wishlist check:', error);
        return NextResponse.json({ isWishlisted: false });
    }
}
