import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

        // Check if bucket exists, if not create it
        const { data: buckets } = await admin.storage.listBuckets();
        if (!buckets?.find(b => b.name === 'product-images')) {
            await admin.storage.createBucket('product-images', { public: true });
        }

        // Upload to Supabase Storage
        const { data, error } = await admin.storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = admin.storage
            .from('product-images')
            .getPublicUrl(data.path);

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (err: any) {
        console.error('Upload Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
