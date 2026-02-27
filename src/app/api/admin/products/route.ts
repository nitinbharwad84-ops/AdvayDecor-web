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
            const { error: variantError } = await admin.from('product_variants').insert(variantRows);
            if (variantError) console.error('Warning: Failed to insert variants:', variantError.message);
        }

        // Insert images if any
        if (images && images.length > 0) {
            const imageRows = images.map((img: Record<string, unknown>, idx: number) => ({
                product_id: product.id,
                image_url: img.image_url,
                display_order: idx,
            }));
            const { error: imageError } = await admin.from('product_images').insert(imageRows);
            if (imageError) console.error('Warning: Failed to insert images:', imageError.message);
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
        const { id, title, slug, description, base_price, category, has_variants, is_active, variants, images } = body;

        if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

        // Update product
        const { error: updateError } = await admin
            .from('products')
            .update({ title, slug, description, base_price, category, has_variants, is_active })
            .eq('id', id);

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

        // Sync variants: delete old, insert new
        if (variants !== undefined) {
            const { error: deleteError } = await admin
                .from('product_variants')
                .delete()
                .eq('parent_product_id', id);

            if (deleteError) {
                console.error('Error deleting old variants:', deleteError);
                return NextResponse.json({
                    error: `Failed to update variants: ${deleteError.message}. This often happens if a variant has already been ordered.`
                }, { status: 500 });
            }

            if (variants.length > 0) {
                const variantRows = variants.map((v: Record<string, unknown>) => ({
                    parent_product_id: id,
                    variant_name: v.variant_name,
                    sku: v.sku,
                    price: v.price,
                    stock_quantity: v.stock_quantity || 0,
                }));
                const { error: insertError } = await admin.from('product_variants').insert(variantRows);
                if (insertError) {
                    console.error('Error inserting new variants:', insertError);
                    return NextResponse.json({ error: `Failed to insert variants: ${insertError.message}` }, { status: 500 });
                }
            }
        }

        // Sync images
        if (images !== undefined) {
            // Fetch old images to identify orphans for storage cleanup
            const { data: oldImages } = await admin
                .from('product_images')
                .select('image_url')
                .eq('product_id', id);

            const newImageUrls = new Set(images.map((img: Record<string, unknown>) => img.image_url as string));
            const orphanedUrls = (oldImages || [])
                .map((img: { image_url: string }) => img.image_url)
                .filter((url: string) => !newImageUrls.has(url));

            // Remove orphaned files from Supabase Storage
            if (orphanedUrls.length > 0) {
                const filePaths = orphanedUrls
                    .map((url: string) => {
                        try {
                            const u = new URL(url);
                            const match = u.pathname.match(/\/storage\/v1\/object\/public\/product-images\/(.+)/);
                            return match ? match[1] : null;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    const { error: storageError } = await admin.storage
                        .from('product-images')
                        .remove(filePaths);
                    if (storageError) {
                        console.warn('Warning: Failed to clean up orphaned storage files:', storageError);
                    }
                }
            }

            const { error: deleteError } = await admin
                .from('product_images')
                .delete()
                .eq('product_id', id);

            if (deleteError) {
                console.warn('Warning: Failed to delete old images:', deleteError);
            }

            if (images.length > 0) {
                const imageRows = images.map((img: Record<string, unknown>, idx: number) => ({
                    product_id: id,
                    image_url: img.image_url,
                    display_order: idx,
                }));
                const { error: insertError } = await admin.from('product_images').insert(imageRows);
                if (insertError) {
                    console.error('Error inserting new images:', insertError);
                    // Unlike variants, we return error here because images are critical
                    return NextResponse.json({ error: `Failed to insert images: ${insertError.message}` }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a product (with storage cleanup)
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

        // Fetch image URLs before deletion so we can clean up storage
        const { data: images } = await admin
            .from('product_images')
            .select('image_url')
            .eq('product_id', id);

        // Delete product from DB (cascades to product_images and product_variants)
        const { error } = await admin.from('products').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Clean up storage files (best-effort, don't fail the request)
        if (images && images.length > 0) {
            try {
                const filenames = images
                    .map((img: { image_url: string }) => {
                        // Extract filename from Supabase storage URL
                        const parts = img.image_url.split('/product-images/');
                        return parts.length > 1 ? parts[parts.length - 1] : null;
                    })
                    .filter(Boolean) as string[];

                if (filenames.length > 0) {
                    await admin.storage.from('product-images').remove(filenames);
                }
            } catch (storageErr) {
                console.error('Warning: Failed to clean up storage files:', storageErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
