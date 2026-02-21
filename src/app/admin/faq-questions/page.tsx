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

    const filteredQuestions = questions.filter(q =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy font-[family-name:var(--font-display)]">FAQ Questions</h1>
                    <p className="text-text-muted text-sm mt-1">Manage and reply to user queries</p>
                </div>
                <div className="relative w-full sm:w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
                {/* Questions List */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-border overflow-hidden flex flex-col h-full">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Loader2 className="animate-spin text-cyan" size={32} />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-cream-light/30">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Mail size={24} className="text-text-muted" />
                            </div>
                            <h3 className="font-semibold text-navy">No questions yet</h3>
                            <p className="text-text-muted text-sm mt-1">When users ask questions, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto w-full">
                            {filteredQuestions.map((question) => (
                                <button
                                    key={question.id}
                                    onClick={() => markAsRead(question)}
                                    className={`w-full text-left p-4 border-b border-border/50 transition-colors hover:bg-cream-light/50 ${selectedQuestion?.id === question.id ? 'bg-cream-light border-l-4 border-l-navy' : 'border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-navy truncate pr-2 flex items-center gap-2">
                                            {question.name}
                                            {question.status === 'new' && (
                                                <span className="w-2 h-2 rounded-full bg-cyan block"></span>
                                            )}
                                        </h4>
                                        <span className="text-xs text-text-muted flex-shrink-0">
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-muted truncate mb-2">{question.question}</p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${question.status === 'replied' ? 'bg-success/10 text-success' :
                                            question.status === 'new' ? 'bg-cyan/10 text-cyan' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Question Detail & Reply Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden flex flex-col h-full relative">
                    {selectedQuestion ? (
                        <div className="flex flex-col h-full max-h-full">
                            {/* Header */}
                            <div className="p-6 border-b border-border bg-cream-light/30 flex-shrink-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-navy mb-1">{selectedQuestion.question}</h2>
                                        <div className="flex items-center gap-4 text-sm text-text-muted">
                                            <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedQuestion.email}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedQuestion.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedQuestion.status === 'replied' ? 'bg-success/10 text-success border border-success/20' :
                                        selectedQuestion.status === 'new' ? 'bg-cyan/10 text-cyan border border-cyan/20' :
                                            'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                        {selectedQuestion.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-navy whitespace-pre-wrap text-sm">
                                    {selectedQuestion.question}
                                </div>
                            </div>

                            {/* Reply Area (Scrollable) */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                {selectedQuestion.status === 'replied' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-success font-medium mb-2 border-b border-border/50 pb-2">
                                            <CheckCircle size={18} />
                                            Admin Reply Sent
                                        </div>
                                        <div className="bg-cream-dark p-5 rounded-xl border border-border text-navy whitespace-pre-wrap text-sm relative">
                                            <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                                                <span className="text-xs text-text-muted opacity-70">Answered on</span>
                                                <span className="text-xs font-medium text-navy/70">{new Date(selectedQuestion.answered_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className="font-semibold block mb-2 opacity-60">Your Answer:</span>
                                            {selectedQuestion.answer_text}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center gap-2 text-navy font-medium mb-4">
                                            <Reply size={18} />
                                            Write an Answer
                                        </div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your answer here... This will be visible on the user's dashboard."
                                            className="w-full flex-1 min-h-[200px] p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white resize-none text-sm transition-all"
                                        />
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={handleReply}
                                                disabled={isReplying || !replyText.trim()}
                                                className="bg-navy text-white px-6 py-2.5 rounded-xl font-medium hover:bg-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                {isReplying ? 'Sending...' : 'Send Answer'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted h-full">
                            <div className="w-20 h-20 bg-cream-light rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="text-border" />
                            </div>
                            <h3 className="text-lg font-semibold text-navy mb-1">Select a question</h3>
                            <p className="text-sm">Choose a question from the list to view details and answer.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
