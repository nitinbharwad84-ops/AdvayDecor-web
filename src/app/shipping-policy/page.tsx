import { Metadata } from 'next';
import ShippingPolicyClient from './ShippingPolicyClient';

export const metadata: Metadata = {
    title: 'Shipping Policy | Delivery Timelines & Rates | Advay Decor',
    description: 'Learn about Advay Decor\'s shipping methods, delivery timelines within India, and international shipping options for our premium home decor.',
    alternates: {
        canonical: '/shipping-policy',
    },
};

export default function ShippingPolicyPage() {
    return <ShippingPolicyClient />;
}
