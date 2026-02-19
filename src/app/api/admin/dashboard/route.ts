import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Dashboard stats (real counts from Supabase)
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const admin = createAdminClient();
        const { data: isAdmin } = await admin.from('admin_users').select('id').eq('id', user.id).single();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Parallel queries
        const [productsRes, ordersRes, pendingRes, revenueRes, recentRes] = await Promise.all([
            admin.from('products').select('id', { count: 'exact', head: true }),
            admin.from('orders').select('id', { count: 'exact', head: true }),
            admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
            admin.from('orders').select('total_amount'),
            admin.from('orders')
                .select(`
                    id, status, total_amount, created_at,
                    guest_info
                `)
                .order('created_at', { ascending: false })
                .limit(5),
        ]);

        const totalProducts = productsRes.count || 0;
        const totalOrders = ordersRes.count || 0;
        const pendingOrders = pendingRes.count || 0;

        // Sum revenue
        const revenue = (revenueRes.data || []).reduce(
            (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount), 0
        );

        // Shape recent orders
        const recentOrders = (recentRes.data || []).map((o: Record<string, unknown>) => {
            const guest = o.guest_info as Record<string, string> | null;
            return {
                id: o.id,
                customer: guest?.name || 'Registered User',
                total: `₹${Number(o.total_amount).toLocaleString('en-IN')}`,
                status: o.status,
                date: getRelativeTime(o.created_at as string),
            };
        });

        return NextResponse.json({
            totalProducts,
            totalOrders,
            pendingOrders,
            revenue,
            recentOrders,
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
}
