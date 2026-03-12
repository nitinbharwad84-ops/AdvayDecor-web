import { Metadata } from 'next';
import ReturnsPolicyClient from './ReturnsPolicyClient';

export const metadata: Metadata = {
    title: 'Returns & Exchanges | 5-Day Easy Returns | Advay Decor',
    description: 'Not entirely in love with your purchase? Learn about our easy 5-day return and exchange policy for all Advay Decor products.',
    alternates: {
        canonical: '/returns',
    },
};

export default function ReturnsPolicyPage() {
    return <ReturnsPolicyClient />;
}
