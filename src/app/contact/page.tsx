import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: 'Contact Us | Customer Support | Advay Decor',
    description: 'Get in touch with Advay Decor. Have questions about our cushion covers or your order? We\'re here to help you create your perfect space.',
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactPage() {
    return <ContactClient />;
}
