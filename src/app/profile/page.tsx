'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Package, ArrowRight, LogOut, Clock, PenLine, Save, X, Phone, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';
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

interface FaqQuestion {
    id: string;
    question: string;
    status: string;
    answer_text: string | null;
    answered_at: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, clearUser, setUser } = useUserAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [faqQuestions, setFaqQuestions] = useState<FaqQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile Details', icon: User },
        { id: 'orders', name: 'Order History', icon: Package },
        { id: 'support', name: 'Support Messages', icon: MessageSquare },
        { id: 'faq', name: 'My FAQ Questions', icon: HelpCircle },
    ];

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

                // 4. Fetch FAQ Questions
                const { data: faqData, error: faqError } = await supabase
                    .from('faq_questions')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                if (faqError && faqError.code !== 'PGRST205') { // ignore table missing if not generated yet
                    console.error('Error fetching faqs:', faqError);
                } else {
                    setFaqQuestions(faqData || []);
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
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem' }}>
                        My Account
                    </h1>
                    <p style={{ color: '#64648b' }}>Manage your profile, view orders, and get support</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar / Tabs */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div style={{
                            background: '#fff', borderRadius: '1.25rem', padding: '1.25rem',
                            border: '1px solid #f0ece4', position: 'sticky', top: '100px',
                            display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }}>
                            {/* User brief */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #00b4d8, #90e0ef)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0
                                }}>
                                    {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a23', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.full_name || 'Valued Customer'}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64648b', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{profile?.email}</p>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #f0ece4', margin: '0 0 0.5rem 0' }} />

                            {/* Nav tabs */}
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.875rem 1rem', borderRadius: '0.75rem',
                                        fontSize: '0.9rem', fontWeight: 500,
                                        background: activeTab === tab.id ? 'rgba(0,180,216,0.08)' : 'transparent',
                                        color: activeTab === tab.id ? '#00b4d8' : '#4b5563',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.2s', width: '100%'
                                    }}
                                >
                                    <tab.icon size={18} style={{ color: activeTab === tab.id ? '#00b4d8' : '#9ca3af' }} />
                                    {tab.name}
                                    {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}

                            <hr style={{ border: 'none', borderTop: '1px solid #f0ece4', margin: '1rem 0' }} />

                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.875rem 1rem', borderRadius: '0.75rem',
                                    fontSize: '0.9rem', fontWeight: 500,
                                    background: 'rgba(239,68,68,0.05)', color: '#ef4444',
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s', width: '100%'
                                }}
                            >
                                <LogOut size={18} style={{ color: '#ef4444' }} />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' && (
                                    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #f0ece4' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>Profile Details</h2>

                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none' }}
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none' }}
                                                        placeholder="+91 98765 43210"
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', background: '#0a0a23', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Save size={16} /> Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', background: '#f8fafc', color: '#4b5563', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f0ece4' }}>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> Email Address</p>
                                                    <p style={{ fontSize: '1rem', color: '#0a0a23', fontWeight: 600 }}>{profile?.email}</p>
                                                </div>
                                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f0ece4' }}>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> Phone Number</p>
                                                    <p style={{ fontSize: '1rem', color: '#0a0a23', fontWeight: 600 }}>{profile?.phone || 'Not provided'}</p>
                                                </div>

                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    style={{ marginTop: '1rem', width: 'fit-content', padding: '0.875rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff', color: '#0a0a23', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                                >
                                                    <PenLine size={16} /> Edit Profile Information
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #f0ece4' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>Order History</h2>

                                        {orders.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#cbd5e1' }}>
                                                    <Package size={32} />
                                                </div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No orders yet</h3>
                                                <p style={{ color: '#64648b', marginBottom: '1.5rem' }}>Looks like you haven't placed any orders yet.</p>
                                                <Link href="/shop" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '2rem', background: '#0a0a23', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    Start Shopping
                                                </Link>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {orders.map((order) => (
                                                    <div key={order.id} style={{ background: '#fdfbf7', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f0ece4' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23' }}>Order #{order.id.slice(0, 8)}</span>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#e0f2fe', color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#b91c1c' : '#0369a1' }}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64648b', fontSize: '0.85rem' }}>
                                                                    <Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00b4d8' }}>{formatCurrency(order.total_amount)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'support' && (
                                    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #f0ece4' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>Support Messages</h2>

                                        {messages.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                                                    <div key={msg.id} style={{ background: '#fdfbf7', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f0ece4' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(msg.created_at).toLocaleString()}</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: msg.status === 'replied' ? '#dcfce7' : '#fef9c3', color: msg.status === 'replied' ? '#166534' : '#854d0e' }}>
                                                                {msg.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.95rem', color: '#0a0a23', marginBottom: msg.reply_text ? '1.5rem' : '0', fontWeight: 500 }}>{msg.message}</p>
                                                        {msg.reply_text && (
                                                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', borderLeft: '4px solid #00b4d8' }}>
                                                                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> Advay Decor Support</p>
                                                                <p style={{ fontSize: '0.9rem', color: '#334155' }}>{msg.reply_text}</p>
                                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>{new Date(msg.replied_at!).toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'faq' && (
                                    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #f0ece4' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>My FAQ Questions</h2>

                                        {faqQuestions.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                                <HelpCircle size={32} style={{ color: '#cbd5e1', margin: '0 auto 1.5rem' }} />
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No questions yet</h3>
                                                <p style={{ color: '#64648b' }}>If you have product questions, ask them in the FAQ section.</p>
                                                <Link href="/faq" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '2rem', background: '#0a0a23', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    View FAQs
                                                </Link>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {faqQuestions.map((q) => (
                                                    <div key={q.id} style={{ background: '#fdfbf7', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f0ece4' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(q.created_at).toLocaleString()}</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: q.status === 'replied' ? '#dcfce7' : '#fef9c3', color: q.status === 'replied' ? '#166534' : '#854d0e' }}>
                                                                {q.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.95rem', color: '#0a0a23', marginBottom: q.answer_text ? '1.5rem' : '0', fontWeight: 500 }}>{q.question}</p>
                                                        {q.answer_text && (
                                                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', borderLeft: '4px solid #00b4d8' }}>
                                                                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={14} /> Advay Decor Answer</p>
                                                                <p style={{ fontSize: '0.9rem', color: '#334155' }}>{q.answer_text}</p>
                                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>{new Date(q.answered_at!).toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
