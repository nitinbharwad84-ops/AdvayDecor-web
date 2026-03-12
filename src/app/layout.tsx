import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#00b4d8",
};
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Toaster } from "react-hot-toast";

import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://advaydecor.in'),
  title: "Advay Decor: Premium Home Decor & Cushion Covers Online India",
  description: "Advay Decor offers artisan cushions, linen covers & designer home decor. Pan-India shipping directly from our Mumbai studio.",
  applicationName: "Advay Decor",
  keywords: [
    "Advay Decor",
    "AdvayDecor",
    "Advaya Decor",
    "Advy Decor",
    "Advey Decor",
    "Advay Dekore",
    "Advaya",
    "home decor online India",
    "cushion covers online India",
    "buy cushions online",
    "luxury cushion covers India",
    "premium cushion covers",
    "hand-embroidered cushions",
    "designer cushion covers",
    "velvet cushion covers Mumbai",
    "artisan home accessories",
    "embroidered cushion covers",
    "linen pillow covers India",
    "modern home decor studio",
    "handmade home decor Mumbai",
    "sofa cushion sets Mumbai",
    "high-end home textiles",
    "living room styling India",
    "bouclé cushions 2026",
    "artisan wall art cushions",
    "boutique home decor India",
    "interior design",
    "Advay online store",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Advay Decor",
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/logo.svg" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Advay Decor: Premium Home Decor & Cushion Covers Online India",
    description: "Advay Decor offers artisan cushions, linen covers & designer home decor. Pan-India shipping directly from our Mumbai studio.",
    type: "website",
    siteName: "Advay Decor",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "Advay Decor Logo",
      },
    ],
  },
  verification: {
    google: "GVNgZZ_0bSD0QJuRyvEBEbGuNuX1xgZ296vLruj4_JY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://awkaeeteelujitzgwzfr.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://awkaeeteelujitzgwzfr.supabase.co" />

        {/* Inline JSON-LD for site name — no need for afterInteractive */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Advay Decor",
              "alternateName": ["AdvayDecor", "Advaya Decor"],
              "url": "https://advaydecor.in"
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* ======================= */}
        {/* Google Analytics 4 (GA4) + Google Ads Tag — Unified */}
        {/* ======================= */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                gtag('config', 'AW-17990232628');
              `}
            </Script>
          </>
        )}

        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0a0a23',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
            },
          }}
        />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('PWA: Service Worker registered successfully');
                  },
                  function(err) {
                    console.log('PWA: Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        <ConditionalNavbar />
        <main className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
