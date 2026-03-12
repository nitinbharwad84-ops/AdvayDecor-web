import Link from 'next/link';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Home Decor Trends & Inspiration | AdvayDecor Blog',
    description: 'Explore the latest home decor trends, styling tips, and seasonal guides for cushion covers and accessories. Expert advice from our Mumbai studio.',
    alternates: {
        canonical: '/trends',
    },
};

const trendArticles = [
    {
        slug: '2026-boucle-cushions',
        title: 'Top Bouclé Cushion Trends 2026',
        description: 'Bouclé is back and bigger than ever. Discover how textured cushion covers are dominating living rooms across India in 2026.',
        tag: 'Trending Now',
        date: 'March 2026',
    },
    // Add more trend articles here as they are created
];

export default function TrendsPage() {
    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Page Header */}
            <section style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #0a0a23, #1a1a3e)',
                padding: '4rem 0 5rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }} />
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <span style={{ color: '#00b4d8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={14} />
                        Inspiration & Trends
                    </span>
                    <h1
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginTop: '0.75rem', marginBottom: '1rem' }}
                    >
                        Home Decor Trends
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                        Stay ahead of the curve with expert styling tips, seasonal guides, and the latest design ideas for cushion covers and home accessories.
                    </p>
                </div>
            </section>

            {/* Trend Articles */}
            <section style={{ padding: '4rem 0 5rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {trendArticles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/trends/${article.slug}`}
                                style={{
                                    display: 'block',
                                    padding: '2rem',
                                    borderRadius: '1.25rem',
                                    background: '#fff',
                                    border: '1px solid #f0ece4',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                        background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(0,180,216,0.03))',
                                        color: '#00b4d8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        <Sparkles size={12} />
                                        {article.tag}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#9e9eb8' }}>{article.date}</span>
                                </div>
                                <h2
                                    className="font-[family-name:var(--font-display)]"
                                    style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}
                                >
                                    {article.title}
                                </h2>
                                <p style={{ color: '#64648b', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {article.description}
                                </p>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00b4d8', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Read Article <ArrowRight size={14} />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
