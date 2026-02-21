'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Reply, X, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';

interface ContactMessage {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: 'new' | 'read' | 'replied';
    reply_text: string | null;
    replied_at: string | null;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            if (error?.code === 'PGRST205') {
                toast.error('Database table missing. Please run the SQL migration in Supabase.');
            } else {
                toast.error('Failed to fetch messages');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMessage || !replyText.trim()) return;

        try {
            setIsReplying(true);
            const res = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply_text: replyText }),
            });

            if (!res.ok) throw new Error('Failed to send reply');

            toast.success('Reply sent successfully!');
            setSelectedMessage(null);
            setReplyText('');
            fetchMessages(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Error sending reply');
        } finally {
            setIsReplying(false);
        }
    };

    const markAsRead = async (msg: ContactMessage) => {
        setSelectedMessage(msg);
        if (msg.status === 'new') {
            try {
                const supabase = createClient();
                await supabase
                    .from('contact_messages')
                    .update({ status: 'read' })
                    .eq('id', msg.id);
                fetchMessages();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const filteredMessages = messages.filter((msg) => {
        const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || msg.status.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const statusOptions = ['All', 'New', 'Read', 'Replied'];

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare style={{ color: '#00b4d8' }} />
                        Messages
                    </h1>
                    <p style={{ color: '#64648b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Manage customer inquiries and messages
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Message List */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Search and Filter */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1', maxWidth: '360px', minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                                    paddingTop: '0.625rem', paddingBottom: '0.625rem',
                                    borderRadius: '0.75rem', border: '1px solid #e8e4dc',
                                    background: '#ffffff', fontSize: '0.875rem',
                                    outline: 'none', color: '#0a0a23',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {statusOptions.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '9999px',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        background: filterStatus === status ? '#0a0a23' : '#f5f0e8',
                                        color: filterStatus === status ? '#ffffff' : '#64648b',
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages grid/list */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64648b' }}>Loading messages...</div>
                    ) : filteredMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                            <MessageSquare size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#64648b' }}>No messages found.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredMessages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => markAsRead(msg)}
                                    style={{
                                        background: selectedMessage?.id === msg.id ? '#f8fafc' : '#fff',
                                        border: `1px solid ${selectedMessage?.id === msg.id ? '#00b4d8' : '#e5e7eb'}`,
                                        borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer',
                                        transition: 'all 0.2s ease', position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 600, color: '#0a0a23', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {msg.name}
                                            {msg.status === 'new' && (
                                                <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                                            )}
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>
                                            {new Date(msg.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64648b', marginBottom: '0.5rem' }}>{msg.email}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {msg.message}
                                    </p>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                            background: msg.status === 'replied' ? '#dcfce7' : msg.status === 'new' ? '#fef9c3' : '#f1f5f9',
                                            color: msg.status === 'replied' ? '#166534' : msg.status === 'new' ? '#854d0e' : '#475569',
                                        }}>
                                            {msg.status.toUpperCase()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Selected Message Details */}
                <AnimatePresence>
                    {selectedMessage && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{
                                width: '400px', background: '#fff', borderRadius: '1rem',
                                border: '1px solid #e5e7eb', overflow: 'hidden', position: 'sticky', top: '100px'
                            }}
                        >
                            {/* Header */}
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ fontWeight: 600, color: '#0a0a23' }}>Message Details</h3>
                                <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>From</p>
                                    <p style={{ fontWeight: 500, color: '#0a0a23' }}>{selectedMessage.name}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#00b4d8' }}><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                                    {selectedMessage.phone && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{selectedMessage.phone}</p>}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message</p>
                                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                        {selectedMessage.message}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} /> Received {new Date(selectedMessage.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {selectedMessage.status === 'replied' ? (
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <CheckCircle size={14} /> Replied
                                        </p>
                                        <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#166534', whiteSpace: 'pre-wrap' }}>
                                            {selectedMessage.reply_text}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} /> Sent {new Date(selectedMessage.replied_at!).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply} style={{ marginTop: '2rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#0a0a23', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Reply size={14} style={{ color: '#00b4d8' }} /> Send a Reply
                                        </p>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your reply... (this will be visible in the user's profile)"
                                            required
                                            rows={5}
                                            style={{
                                                width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                                                border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none',
                                                resize: 'vertical', marginBottom: '1rem', fontFamily: 'inherit'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isReplying}
                                            style={{
                                                width: '100%', padding: '0.75rem', background: '#0a0a23',
                                                color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 600,
                                                cursor: isReplying ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                                opacity: isReplying ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            {isReplying ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
