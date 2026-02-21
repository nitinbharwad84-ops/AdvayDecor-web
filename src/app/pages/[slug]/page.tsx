import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    // We get the title just for metadata
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('page_content')
        .select('title')
        .eq('slug', slug)
        .single();

    if (!data) return { title: 'Page Not Found | Advay Decor' };

    return {
        title: `${data.title} | Advay Decor`,
        description: `Read the ${data.title} for Advay Decor.`,
    };
}

export default async function DynamicContentPage({ params }: PageProps) {
    const { slug } = await params;

    const supabase = createAdminClient();

    // Fetch page content mapped to this slug
    const { data: pageData, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !pageData) {
        console.error('Error fetching page content:', error);

        // Show a helpful error if the table hasn't been created yet
        if (error?.code === '42P01' || error?.code === 'PGRST205') {
            return (
                <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444', marginBottom: '1rem' }}>Database Setup Required</h1>
                        <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
                            The page content cannot be displayed because the <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>page_content</code> table hasn't been created in Supabase yet.
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            Please instruct the administrator to run the latest SQL migration in the Supabase Dashboard SQL Editor.
                        </p>
                    </div>
                </div>
            );
        }

        notFound();
    }

    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: 'calc(100vh - 200px)', background: '#faf9f6' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
                <Link href="/" style={{ color: '#00b4d8', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
                    ← Back to Home
                </Link>

                <div style={{ background: '#fff', padding: '3rem', borderRadius: '1.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #f0ece4' }}>
                    <h1 className="font-[family-name:var(--font-display)]" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f0ece4' }}>
                        {pageData.title}
                    </h1>

                    <div style={{
                        color: '#334155',
                        lineHeight: 1.8,
                        fontSize: '1rem',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {pageData.content}
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #e5e7eb', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Last updated: {new Date(pageData.updated_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
