import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Toaster } from "react-hot-toast";

import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.advaydecor.com'),
  title: "AdvayDecor — Elevate Your Space with Elegance & Style",
  description: "Discover curated, artisanal home decor. Premium cushions, artistic accents, and stylish solutions to transform your living space. Pan-India delivery.",
  keywords: ["home decor", "cushions", "interior design", "artisanal", "India", "AdvayDecor"],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "AdvayDecor — Elevate Your Space with Elegance & Style",
    description: "Discover curated, artisanal home decor. Premium cushions, artistic accents, and stylish solutions.",
    type: "website",
    siteName: "AdvayDecor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* ======================= */}
        {/* Google Analytics 4 (GA4) */}
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
              `}
            </Script>
          </>
        )}

        {/* ======================= */}
        {/* Meta (Facebook) Pixel    */}
        {/* ======================= */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
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
        <ConditionalNavbar />
        <main className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
