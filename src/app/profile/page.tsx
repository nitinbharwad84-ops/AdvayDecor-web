'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Package, ArrowRight, LogOut, Clock, PenLine, Save, X, Phone, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';
import { useUserAuthStore } from '@/lib/auth-store';
import { formatCurrency } from '@/lib/utils';

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: any[];
}

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
}

interface ContactMessage {
    id: string;
    message: string;
    status: string;
    reply_text: string | null;
    replied_at: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, clearUser, setUser } = useUserAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    useEffect(() => {
        // Auth check
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const supabase = createClient();

                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user?.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                }

                if (profileData) {
                    setProfile(profileData);
                    setEditName(profileData.full_name || '');
                    setEditPhone(profileData.phone || '');
                } else if (user) {
                    // Fallback to auth store data if profile missing
                    setProfile({
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name || '',
                        phone: ''
                    });
                    setEditName(user.full_name || '');
                }

                // 2. Fetch Orders
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                if (ordersError) {
                    console.error('Error fetching orders:', ordersError);
                } else {
                    setOrders(ordersData || []);
                }

                // 3. Fetch Messages
                const { data: messagesData, error: messagesError } = await supabase
                    .from('contact_messages')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                if (messagesError) {
                    console.error('Error fetching messages:', messagesError);
                } else {
                    setMessages(messagesData || []);
                }

            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchData();
        }
    }, [isAuthenticated, router, user]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearUser();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const handleSaveProfile = async () => {
        if (!user?.id) return;

        try {
            const supabase = createClient();

            const updates = {
                id: user.id,
                full_name: editName,
                phone: editPhone,
                email: user.email, // Ensure email is kept
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            setProfile(prev => prev ? { ...prev, full_name: editName, phone: editPhone } : null);
            setIsEditing(false);
            toast.success('Profile updated successfully');

            // Update local store as well
            setUser({
                ...user,
                full_name: editName
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                paddingTop: 'var(--nav-height, 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fdfbf7'
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(0,180,216,0.2)', borderTop: '3px solid #00b4d8',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Redirect handled in useEffect

    return (
        <div style={{
            minHeight: '100vh',
            paddingTop: 'var(--nav-height, 80px)',
            background: '#fdfbf7',
            paddingBottom: '4rem'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)]"
                            style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>
                            My Profile
                        </h1>
                        <p style={{ color: '#64648b' }}>Manage your account and view orders</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                            background: '#fff', border: '1px solid #f0ece4',
                            color: '#ef4444', fontWeight: 600, fontSize: '0.9rem',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.25rem', padding: '2rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0ece4',
                                position: 'sticky', top: '100px'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #00b4d8, #90e0ef)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem', color: '#fff'
                                }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                                        {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem' }}>
                                    {profile?.full_name || 'Valued Customer'}
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#64648b' }}>{profile?.email}</p>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #f0ece4', margin: '1.5rem 0' }} />

                            {/* Details / Edit Form */}
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Full Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                                border: '1px solid #e5e7eb', fontSize: '0.9rem'
                                            }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Phone</label>
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                                border: '1px solid #e5e7eb', fontSize: '0.9rem'
                                            }}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button
                                            onClick={handleSaveProfile}
                                            style={{
                                                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                                                background: '#0a0a23', color: '#fff', border: 'none',
                                                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            style={{
                                                padding: '0.75rem', borderRadius: '0.5rem',
                                                background: '#f3f4f6', color: '#4b5563', border: 'none',
                                                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                                        <Mail size={16} style={{ color: '#64748b' }} />
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Email</p>
                                            <p style={{ fontSize: '0.9rem', color: '#0a0a23', fontWeight: 500 }}>{profile?.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                                        <Phone size={16} style={{ color: '#64748b' }} />
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Phone</p>
                                            <p style={{ fontSize: '0.9rem', color: '#0a0a23', fontWeight: 500 }}>{profile?.phone || 'Not set'}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            marginTop: '0.5rem', width: '100%',
                                            padding: '0.75rem', borderRadius: '0.75rem',
                                            border: '1px solid #e2e8f0', background: '#fff',
                                            color: '#0a0a23', fontWeight: 600, fontSize: '0.85rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <PenLine size={14} /> Edit Profile
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Orders History */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>
                                Order History
                            </h2>

                            {orders.length === 0 ? (
                                <div style={{
                                    background: '#fff', borderRadius: '1.25rem', padding: '3rem',
                                    textAlign: 'center', border: '1px solid #f0ece4'
                                }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                                        color: '#cbd5e1'
                                    }}>
                                        <Package size={32} />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No orders yet</h3>
                                    <p style={{ color: '#64648b', marginBottom: '1.5rem' }}>Looks like you haven't placed any orders yet.</p>
                                    <Link
                                        href="/shop"
                                        style={{
                                            display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '2rem',
                                            background: '#0a0a23', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            style={{
                                                background: '#fff', borderRadius: '1rem', padding: '1.5rem',
                                                border: '1px solid #f0ece4', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', gap: '1rem'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a0a23' }}>
                                                            Order #{order.id.slice(0, 8)}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                            background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#e0f2fe',
                                                            color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#b91c1c' : '#0369a1'
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64648b', fontSize: '0.85rem' }}>
                                                        <Clock size={14} />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a23' }}>
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Could add items preview here if order_items logic is joined via hook, but currently order variable only has items if joined. 
                                                The fetch logic didn't join items. Keeping it simple. */}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Customer Support Messages */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem', marginTop: '2rem' }}>
                                Support Messages
                            </h2>

                            {messages.length === 0 ? (
                                <div style={{
                                    background: '#fff', borderRadius: '1.25rem', padding: '3rem',
                                    textAlign: 'center', border: '1px solid #f0ece4'
                                }}>
                                    <MessageSquare size={32} style={{ color: '#cbd5e1', margin: '0 auto 1.5rem' }} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No messages yet</h3>
                                    <p style={{ color: '#64648b' }}>If you need help, feel free to contact our support.</p>
                                    <Link href="/contact" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '2rem', background: '#0a0a23', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                        Contact Support
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {messages.map((msg) => (
                                        <div key={msg.id} style={{
                                            background: '#fff', borderRadius: '1rem', padding: '1.5rem',
                                            border: '1px solid #f0ece4'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(msg.created_at).toLocaleString()}</span>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                    background: msg.status === 'replied' ? '#dcfce7' : '#fef9c3',
                                                    color: msg.status === 'replied' ? '#166534' : '#854d0e'
                                                }}>
                                                    {msg.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.95rem', color: '#0a0a23', marginBottom: msg.reply_text ? '1rem' : '0' }}>{msg.message}</p>

                                            {msg.reply_text && (
                                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginTop: '1rem', borderLeft: '3px solid #00b4d8' }}>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Advay Decor Support</p>
                                                    <p style={{ fontSize: '0.9rem', color: '#334155' }}>{msg.reply_text}</p>
                                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>{new Date(msg.replied_at!).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
