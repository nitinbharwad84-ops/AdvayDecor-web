import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AdvayDecor — Elevate Your Space with Elegance & Style",
  description: "Discover curated, artisanal home decor. Premium cushions, artistic accents, and stylish solutions to transform your living space. Pan-India delivery.",
  keywords: ["home decor", "cushions", "interior design", "artisanal", "India", "AdvayDecor"],
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
