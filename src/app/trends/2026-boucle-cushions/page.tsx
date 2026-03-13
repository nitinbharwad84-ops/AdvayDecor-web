import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Star, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Top Bouclé Cushion Trends 2026 | AdvayDecor',
    description: 'Bouclé cushions are the hottest home decor trend in 2026. Discover styling tips, best pairings, and where to buy premium bouclé cushion covers online in India.',
    keywords: [
        'bouclé cushions 2026',
        'bouclé cushion covers',
        'textured cushions India',
        'home decor trends 2026',
        'living room cushion trends',
    ],
    alternates: {
        canonical: 'https://www.advaydecor.in/trends/2026-boucle-cushions',
    },
    openGraph: {
        title: 'Top Bouclé Cushion Trends 2026',
        description: 'Bouclé cushions are the hottest home decor trend in 2026.',
        type: 'article',
    },
};

export default function BoucleCushions2026() {
    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)' }}>
            {/* Breadcrumb */}
            <div style={{ background: '#f5f0e8', borderBottom: '1px solid #f0ece4' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0.75rem 1.5rem' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9e9eb8' }}>
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                        <span>›</span>
                        <Link href="/trends" style={{ color: 'inherit', textDecoration: 'none' }}>Trends</Link>
                        <span>›</span>
                        <span style={{ color: '#0a0a23', fontWeight: 500 }}>Bouclé Cushions 2026</span>
                    </nav>
                </div>
            </div>

            {/* Article */}
            <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.25rem 0.75rem', borderRadius: '9999px',
                            background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(0,180,216,0.03))',
                            color: '#00b4d8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            <TrendingUp size={12} />
                            Trending Now
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#9e9eb8' }}>March 2026</span>
                    </div>
                    <h1
                        className="font-[family-name:var(--font-display)]"
                        style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem', lineHeight: 1.2 }}
                    >
                        Top Bouclé Cushion Trends 2026
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64648b', lineHeight: 1.7 }}>
                        Bouclé — the looped, textured fabric that defined luxury interiors — is making a massive comeback in 2026. Here&apos;s everything you need to know about styling bouclé cushion covers in your home.
                    </p>
                </div>

                {/* Content Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Section 1 */}
                    <section>
                        <h2 className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}>
                            Why Bouclé is Dominating 2026
                        </h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1rem' }}>
                            The tactile, cloud-like quality of bouclé fabric brings warmth and dimension to any space. Interior designers across India are recommending bouclé cushion covers as the easiest way to add texture to modern minimalist homes.
                        </p>
                        <div style={{
                            padding: '1.5rem', borderRadius: '1rem', background: '#fdfbf7', border: '1px solid #f0ece4',
                            display: 'flex', flexDirection: 'column', gap: '0.75rem',
                        }}>
                            {[
                                'Natural tactile appeal — inviting and cozy',
                                <span>Pairs beautifully with <Link href="/cushions/linen-covers" style={{ color: '#00b4d8', textDecoration: 'underline' }}>linen and cotton textures</Link></span>,
                                'Works in both warm and neutral color palettes',
                                'Durable and long-lasting fabric choice',
                            ].map((point, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <CheckCircle size={16} style={{ color: '#00b4d8', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>{point}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}>
                            How to Style Bouclé Cushions
                        </h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1rem' }}>
                            The key to styling bouclé is contrast. Pair your textured bouclé cushion covers with smooth materials — think sleek velvet sofas or polished wooden furniture. Layer different sizes (40cm and 50cm) for a designer look.
                        </p>
                        <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem' }}>
                            For a cohesive aesthetic, stick to a muted palette — ivory, oatmeal, blush, and sage greens work beautifully. Add one statement embroidered cushion from your existing collection to create a curated, magazine-worthy arrangement.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1rem' }}>
                            Best Rooms for Bouclé Cushions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '1rem' }}>
                            {[
                                { icon: Star, room: 'Living Room', tip: 'Arrange 3-5 bouclé cushions on your sofa for maximum impact.' },
                                { icon: Star, room: 'Bedroom', tip: 'Layer bouclé with linen pillows for a luxurious bedscape.' },
                                { icon: Star, room: 'Reading Nook', tip: 'A single oversized bouclé cushion adds instant comfort.' },
                            ].map((item) => (
                                <div key={item.room} style={{
                                    padding: '1.25rem', borderRadius: '1rem', background: '#fff', border: '1px solid #f0ece4',
                                    textAlign: 'center',
                                }}>
                                    <item.icon size={24} style={{ color: '#00b4d8', margin: '0 auto 0.75rem' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.5rem' }}>{item.room}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#64648b', lineHeight: 1.5 }}>{item.tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <div style={{
                        padding: '2rem', borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, #0a0a23, #1a1a3e)',
                        textAlign: 'center',
                    }}>
                        <h3 className="font-[family-name:var(--font-display)]" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                            Ready to Upgrade Your Space?
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Explore our curated collection of <Link href="/shop" style={{ color: '#00b4d8', textDecoration: 'underline' }}>premium cushion covers</Link> — from bouclé textures to vibrant embroidered designs.
                        </p>
                        <Link
                            href="/shop"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.875rem 2rem', borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #00b4d8, #0096b7)',
                                color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(0,180,216,0.25)',
                            }}
                        >
                            Buy designer sofa cushions
                        </Link>
                    </div>
                </div>

                {/* Back Link */}
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f0ece4' }}>
                    <Link
                        href="/trends"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00b4d8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                        <ArrowLeft size={14} />
                        Back to all trends
                    </Link>
                </div>
            </article>
        </div>
    );
}
