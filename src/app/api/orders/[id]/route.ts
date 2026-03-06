import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';
import { cancelShiprocketOrder } from '@/lib/shiprocket';

// GET: Fetch a single order's full details (authenticated user only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignored in server context
                        }
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch the order — RLS ensures user can only see their own orders
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch order items
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
        }

        // Fetch user profile for contact info
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            ...order,
            items: items || [],
            profile: profile || null,
        });
    } catch (err) {
        console.error('Error fetching order details:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update order (cancel/return) by user
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { /* ignored */ },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const body = await request.json();
        const { status: requestedStatus } = body;

        if (!requestedStatus || !['Cancelled', 'Returned'].includes(requestedStatus)) {
            return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Fetch current order state
        const { data: order, error: fetchErr } = await admin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        if (order.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // 2. Business Logic Checks
        if (requestedStatus === 'Cancelled') {
            // Cannot cancel if already Shipped or Delivered
            if (['Shipped', 'Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
                return NextResponse.json({ error: 'Order cannot be cancelled in current state' }, { status: 400 });
            }
            // If Shiprocket has an AWB, we shouldn't allow simple user-side cancellation without admin intervention
            if (order.tracking_id) {
                return NextResponse.json({ error: 'Shipment already initiated. Please contact support to cancel.' }, { status: 400 });
            }
        }

        if (requestedStatus === 'Returned') {
            if (order.status !== 'Delivered') {
                return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 });
            }
        }

        // 3. Perform update
        const { error: updateErr } = await admin
            .from('orders')
            .update({ status: requestedStatus })
            .eq('id', id);

        if (updateErr) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

        // 4. If SR ID exists and we are cancelling, try to notify SR (best effort)
        if (requestedStatus === 'Cancelled' && order.shiprocket_order_id) {
            try {
                await cancelShiprocketOrder([Number(order.shiprocket_order_id)]);
            } catch (e) {
                console.warn('Silent SR cancel failure on user request:', e);
                // Admin will see the status mismatch later
            }
        }

        return NextResponse.json({ success: true, status: requestedStatus });
    } catch (err) {
        console.error('Error updating order:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
