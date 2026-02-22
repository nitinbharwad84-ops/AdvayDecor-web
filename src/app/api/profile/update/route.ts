import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { fullName, phone } = await request.json();

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // Use upsert to handle both existing and missing profile rows (e.g. for admins)
        const { error: profileError } = await admin
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: fullName,
                phone: phone,
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile Update Error:', profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // Also update the user's display name in auth.users meta data for consistency
        await admin.auth.admin.updateUserById(user.id, {
            user_metadata: { full_name: fullName }
        });

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Internal Server Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
