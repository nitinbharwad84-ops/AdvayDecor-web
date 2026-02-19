import Hero from '@/components/home/Hero';
import TrustBadges from '@/components/home/TrustBadges';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import HomeHighlights from '@/components/home/HomeHighlights';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <FeaturedCollection />
      <HomeHighlights />
    </>
  );
}
