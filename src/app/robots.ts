import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/'],
                disallow: [
                    '/api/',
                    '/admin',
                    '/admin-login',
                    '/seo/',
                    '/seo-login/',
                    '/profile',
                    '/login',
                    '/cart',
                    '/checkout',
                    '/orders',
                    // Prevent crawling parameterized/filtered URLs
                    '/shop?*',
                    '/*?sort=*',
                    '/*?variant=*',
                    '/*?page=*',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: ['/api/shopping-feed'],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
