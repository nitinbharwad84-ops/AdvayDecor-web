'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';
import { useUserAuthStore } from '@/lib/auth-store';

type Mode = 'login' | 'signup';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUserAuthStore();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();

            if (mode === 'signup') {
                // --- Sign Up ---
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                    },
                });

                if (error) {
                    toast.error(error.message);
                    return;
                }

                if (data.user) {
                    setUser({
                        id: data.user.id,
                        email: data.user.email || email,
                        full_name: fullName,
                    });
                    toast.success('Account created successfully! Welcome to AdvayDecor.');
                    router.push('/');
                }
            } else {
                // --- Sign In ---
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    toast.error(error.message);
                    return;
                }

                if (data.user) {
                    setUser({
                        id: data.user.id,
                        email: data.user.email || email,
                        full_name: data.user.user_metadata?.full_name || '',
                    });
                    toast.success('Welcome back!');
                    router.push('/');
                }
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
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
        border: '1px solid #e8e4dc',
        background: '#fdfbf7',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s',
        color: '#0a0a23',
    };

    return (
        <div style={{
            paddingTop: 'var(--nav-height, 80px)',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #fdfbf7 0%, #f5f0e8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '420px' }}
            >
                {/* Logo / Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', textDecoration: 'none' }}>
                        <Image
                            src="/logo.png"
                            alt="Advay Decor"
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                        <span className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            <span style={{ color: '#0a0a23' }}>Advay</span>
                            <span style={{ color: '#00b4d8' }}>Decor</span>
                        </span>
                    </Link>
                    <h1 className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#9e9eb8' }}>
                        {mode === 'login'
                            ? 'Sign in to your account to continue'
                            : 'Join AdvayDecor and start shopping'
                        }
                    </p>
                </div>

                {/* Mode Tabs */}
                <div style={{
                    display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                    background: '#f5f0e8', borderRadius: '0.75rem', padding: '0.25rem',
                }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{
                            flex: 1, padding: '0.625rem', borderRadius: '0.625rem', border: 'none',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                            background: mode === 'login' ? '#fff' : 'transparent',
                            color: mode === 'login' ? '#0a0a23' : '#9e9eb8',
                            boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <LogIn size={14} />
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        style={{
                            flex: 1, padding: '0.625rem', borderRadius: '0.625rem', border: 'none',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                            background: mode === 'signup' ? '#fff' : 'transparent',
                            color: mode === 'signup' ? '#0a0a23' : '#9e9eb8',
                            boxShadow: mode === 'signup' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <UserPlus size={14} />
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <motion.form
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    style={{
                        padding: '2rem',
                        borderRadius: '1.25rem',
                        background: '#ffffff',
                        border: '1px solid #f0ece4',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Full Name (signup only) */}
                        {mode === 'signup' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        placeholder="Your full name"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.375rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9eb8' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#9e9eb8', cursor: 'pointer', padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p style={{ fontSize: '0.7rem', color: '#9e9eb8', marginTop: '0.375rem' }}>
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                            color: '#fff',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(0,180,216,0.25)',
                            transition: 'all 0.3s ease',
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {isLoading ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Admin link */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#9e9eb8' }}>
                    Admin?{' '}
                    <Link href="/admin-login" style={{ color: '#00b4d8', fontWeight: 600, textDecoration: 'none' }}>
                        Login here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
