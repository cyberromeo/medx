import "./app.css";
import { Space_Grotesk, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import MobileNav from "@/components/MobileNav";
import { Analytics } from '@vercel/analytics/next';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-accent" });

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
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${outfit.variable} antialiased bg-black text-foreground`}>
        {children}
        <MobileNav />
        <Analytics />
      </body>
    </html >
  );
}
