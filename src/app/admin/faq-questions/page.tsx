'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Mail, CheckCircle, AlertCircle, Calendar, Reply, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFaqQuestionsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('faq_questions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === 'PGRST205') {
                    toast.error('faq_questions table is missing. Please run the SQL schema.', { duration: 5000 });
                } else {
                    throw error;
                }
            }
            setQuestions(data || []);
        } catch (error: any) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!selectedQuestion || !replyText.trim()) return;

        setIsReplying(true);
        try {
            const res = await fetch(`/api/admin/faq-questions/${selectedQuestion.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply_text: replyText }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reply');

            toast.success('Reply sent successfully!');
            setReplyText('');
            setSelectedQuestion({
                ...selectedQuestion,
                status: 'replied',
                answer_text: replyText,
                answered_at: new Date().toISOString(),
            });
            fetchQuestions(); // Refresh list to update status
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error sending reply');
        } finally {
            setIsReplying(false);
        }
    };

    const markAsRead = async (question: any) => {
        setSelectedQuestion(question);
        if (question.status === 'new') {
            try {
                await supabase
                    .from('faq_questions')
                    .update({ status: 'read' })
                    .eq('id', question.id);
                fetchQuestions();
            } catch (error) {
                console.error('Error updating status', error);
            }
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.question.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || q.status.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const statusOptions = ['All', 'New', 'Replied'];

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a0a23', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-display)' }}>
                        <MessageCircle style={{ color: '#00b4d8' }} />
                        FAQ Questions
                    </h1>
                    <p style={{ color: '#64648b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Manage and reply to user queries
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Questions List */}
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

                    {/* Questions grid/list */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64648b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: '#00b4d8' }} />
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                            <Mail size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No questions yet</h3>
                            <p style={{ color: '#64648b' }}>When users ask questions, they will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredQuestions.map((q) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => markAsRead(q)}
                                    style={{
                                        background: selectedQuestion?.id === q.id ? '#f8fafc' : '#fff',
                                        border: `1px solid ${selectedQuestion?.id === q.id ? '#00b4d8' : '#e5e7eb'}`,
                                        borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer',
                                        transition: 'all 0.2s ease', position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 600, color: '#0a0a23', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {q.name}
                                            {q.status === 'new' && (
                                                <span style={{ width: '8px', height: '8px', background: '#00b4d8', borderRadius: '50%' }} />
                                            )}
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {q.question}
                                    </p>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                            background: q.status === 'replied' ? '#dcfce7' : q.status === 'new' ? '#e0f2fe' : '#f1f5f9',
                                            color: q.status === 'replied' ? '#166534' : q.status === 'new' ? '#0369a1' : '#475569',
                                        }}>
                                            {q.status.toUpperCase()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Selected Question Details */}
                <div style={{ width: '100%', maxWidth: '450px' }}>
                    <AnimatePresence mode="wait">
                        {selectedQuestion ? (
                            <motion.div
                                key="selected-question"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{
                                    background: '#fff', borderRadius: '1rem',
                                    border: '1px solid #e5e7eb', overflow: 'hidden', position: 'sticky', top: '100px'
                                }}
                            >
                                {/* Header */}
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f0ece4', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ fontWeight: 600, color: '#0a0a23', fontSize: '1.1rem' }}>Question Details</h3>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                            background: selectedQuestion.status === 'replied' ? '#dcfce7' : selectedQuestion.status === 'new' ? '#e0f2fe' : '#f1f5f9',
                                            color: selectedQuestion.status === 'replied' ? '#166534' : selectedQuestion.status === 'new' ? '#0369a1' : '#475569',
                                            border: `1px solid ${selectedQuestion.status === 'replied' ? '#bbf7d0' : selectedQuestion.status === 'new' ? '#bae6fd' : '#e2e8f0'}`,
                                        }}>
                                            {selectedQuestion.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} /> <a href={`mailto:${selectedQuestion.email}`} style={{ color: '#00b4d8' }}>{selectedQuestion.email}</a>
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} /> {new Date(selectedQuestion.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#0a0a23', whiteSpace: 'pre-wrap', border: '1px solid #e5e7eb' }}>
                                            {selectedQuestion.question}
                                        </div>
                                    </div>

                                    {selectedQuestion.status === 'replied' ? (
                                        <div>
                                            <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <CheckCircle size={16} /> Admin Reply Sent
                                            </p>
                                            <div style={{ background: '#fdfbf7', padding: '1.25rem', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#0a0a23', whiteSpace: 'pre-wrap', border: '1px solid #f0ece4', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Answered on</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#0a0a23', fontWeight: 500 }}>{new Date(selectedQuestion.answered_at).toLocaleDateString()}</p>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Answer:</p>
                                                {selectedQuestion.answer_text}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#0a0a23', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Reply size={16} style={{ color: '#00b4d8' }} /> Write an Answer
                                            </p>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your answer here... This will be visible on the user's dashboard."
                                                style={{
                                                    width: '100%', minHeight: '180px', padding: '1rem',
                                                    border: '1px solid #e5e7eb', borderRadius: '0.75rem',
                                                    fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                                                    fontFamily: 'inherit', marginBottom: '1rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={handleReply}
                                                    disabled={isReplying || !replyText.trim()}
                                                    style={{
                                                        padding: '0.75rem 1.5rem', background: '#0a0a23', color: '#fff',
                                                        border: 'none', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                                                        cursor: (isReplying || !replyText.trim()) ? 'not-allowed' : 'pointer',
                                                        opacity: (isReplying || !replyText.trim()) ? 0.7 : 1,
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {isReplying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                    {isReplying ? 'Sending...' : 'Send Answer'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    height: '400px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                                    padding: '2rem', background: '#f8fafc', borderRadius: '1rem',
                                    border: '1px dashed #cbd5e1'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    <MessageCircle size={32} style={{ color: '#94a3b8' }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>Select a question</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '250px' }}>
                                    Choose a question from the list to view details and answer.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
