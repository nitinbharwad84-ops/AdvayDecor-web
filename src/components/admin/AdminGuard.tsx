'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAdminAuthStore } from '@/lib/auth-store';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { isAdminAuthenticated } = useAdminAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAdminAuthenticated) {
            router.replace('/admin-login');
        }
    }, [mounted, isAdminAuthenticated, router]);

    if (!mounted) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a23',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(0,180,216,0.2)',
                    borderTop: '3px solid #00b4d8',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    if (!isAdminAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a23',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                color: 'rgba(255,255,255,0.5)',
            }}>
                <Shield size={32} />
                <p style={{ fontSize: '0.9rem' }}>Redirecting to admin login...</p>
            </div>
        );
    }

    return <>{children}</>;
}
