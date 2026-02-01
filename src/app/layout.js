import "./app.css";
import { Inter, Outfit } from "next/font/google";
import MobileNav from "@/components/MobileNav";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "MedX - Medical Video Platform",
  description: "Premium FMGE preparation platform",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'dark only',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MedX',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-black text-foreground`}>
        {children}
        <MobileNav />
        <Analytics />
      </body>
    </html>
  );
}
