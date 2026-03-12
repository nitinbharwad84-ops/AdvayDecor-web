import { Metadata } from 'next';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
    title: 'FAQs | Home Decor & Order Queries | Advay Decor',
    description: 'Find answers to frequently asked questions about Advay Decor products, shipping, returns, and artisan craftsmanship.',
    alternates: {
        canonical: '/faq',
    },
};

export default function FAQPage() {
    return <FAQClient />;
}
