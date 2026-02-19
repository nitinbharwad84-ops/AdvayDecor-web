import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Fetch all orders with items
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { data: orders, error } = await admin
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .order('created_at', { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Reshape: extract customer info from guest_info or user_id
        const shaped = (orders || []).map((o: Record<string, unknown>) => {
            const guest = o.guest_info as Record<string, string> | null;
            return {
                ...o,
                items: o.order_items || [],
                customer_name: guest?.name || 'Registered User',
                customer_email: guest?.email || '',
                customer_phone: guest?.phone || '',
            };
        });

        return NextResponse.json(shaped);
    } catch (err) {
        console.error('Error fetching orders:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update order status
export async function PUT(request: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { error } = await admin
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating order:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
