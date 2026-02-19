'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';
import { useAdminAuthStore } from '@/lib/auth-store';

export default function AdminLoginPage() {
    const router = useRouter();
    const { setAdminAuth } = useAdminAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const supabase = createClient();

            // Step 1: Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                toast.error(authError.message);
                setIsLoading(false);
                return;
            }

            if (!authData.user) {
                setError('Login failed. Please try again.');
                setIsLoading(false);
                return;
            }

            // Step 2: Check if user exists in admin_users table (separate from profiles)
            const { data: adminUser, error: adminError } = await supabase
                .from('admin_users')
                .select('role, email')
                .eq('id', authData.user.id)
                .single();

            if (adminError || !adminUser) {
                setError('Access denied. This account is not an admin.');
                toast.error('Access denied. Not an admin account.');
                await supabase.auth.signOut();
                setIsLoading(false);
                return;
            }

            // Step 3: Success — store admin session
            setAdminAuth(adminUser.email || email);
            toast.success('Welcome, Admin!');
            router.push('/admin/dashboard');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        paddingLeft: '2.75rem',
        paddingRight: '1rem',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s',
        color: '#ffffff',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(145deg, #0a0a23 0%, #1a1a3e 50%, #0a0a23 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glows */}
            <div style={{
                position: 'absolute', top: '-200px', right: '-200px', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-150px', left: '-150px', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(0,180,216,0.05) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                        style={{
                            width: '5rem', height: '5rem', borderRadius: '1.25rem',
                            background: 'linear-gradient(135deg, rgba(0,180,216,0.15), rgba(0,180,216,0.05))',
                            border: '1px solid rgba(0,180,216,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}
                    >
                        <Image
                            src="/logo.png"
                            alt="Advay Decor"
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </motion.div>

                    <h1 className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                        Admin Login
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>
                        Authorized personnel only
                    </p>
                </div>

                {/* Login Form — NO sign up */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        padding: '2rem',
                        borderRadius: '1.25rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171', fontSize: '0.8rem', fontWeight: 500,
                                marginBottom: '1.25rem', textAlign: 'center',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.375rem' }}>
                                Admin Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                    placeholder="admin@email.com"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.375rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    required
                                    placeholder="••••••••"
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', marginTop: '1.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                            color: '#fff', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                            border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            boxShadow: '0 4px 20px rgba(0,180,216,0.3)',
                            transition: 'all 0.3s ease',
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {isLoading ? (
                            <div style={{
                                width: '20px', height: '20px',
                                border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
                                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                            }} />
                        ) : (
                            <>
                                Access Dashboard
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Back to website */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                        ← Back to AdvayDecor
                    </Link>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
