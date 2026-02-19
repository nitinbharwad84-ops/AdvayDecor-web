import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Fetch all products with variants and images
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { data: products, error } = await admin
            .from('products')
            .select(`
                *,
                product_variants (*),
                product_images (*)
            `)
            .order('created_at', { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Reshape to match frontend types
        const shaped = (products || []).map((p: Record<string, unknown>) => ({
            ...p,
            variants: p.product_variants || [],
            images: p.product_images || [],
        }));

        return NextResponse.json(shaped);
    } catch (err) {
        console.error('Error fetching products:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { title, slug, description, base_price, category, has_variants, is_active, variants, images } = body;

        // Insert product
        const { data: product, error: productError } = await admin
            .from('products')
            .insert({ title, slug, description, base_price, category, has_variants, is_active })
            .select()
            .single();

        if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

        // Insert variants if any
        if (variants && variants.length > 0) {
            const variantRows = variants.map((v: Record<string, unknown>) => ({
                parent_product_id: product.id,
                variant_name: v.variant_name,
                sku: v.sku,
                price: v.price,
                stock_quantity: v.stock_quantity || 0,
            }));
            await admin.from('product_variants').insert(variantRows);
        }

        // Insert images if any
        if (images && images.length > 0) {
            const imageRows = images.map((img: Record<string, unknown>, idx: number) => ({
                product_id: product.id,
                image_url: img.image_url,
                display_order: idx,
            }));
            await admin.from('product_images').insert(imageRows);
        }

        return NextResponse.json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update a product
export async function PUT(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { id, title, slug, description, base_price, category, has_variants, is_active, variants } = body;

        if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

        // Update product
        const { error: updateError } = await admin
            .from('products')
            .update({ title, slug, description, base_price, category, has_variants, is_active })
            .eq('id', id);

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

        // Sync variants: delete old, insert new
        if (variants !== undefined) {
            await admin.from('product_variants').delete().eq('parent_product_id', id);

            if (variants.length > 0) {
                const variantRows = variants.map((v: Record<string, unknown>) => ({
                    parent_product_id: id,
                    variant_name: v.variant_name,
                    sku: v.sku,
                    price: v.price,
                    stock_quantity: v.stock_quantity || 0,
                }));
                await admin.from('product_variants').insert(variantRows);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

        const { error } = await admin.from('products').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
