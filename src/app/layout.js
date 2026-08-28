import "./app.css";
import "./defi-landing.css";
import MobileNav from "@/components/MobileNav";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { ChatXProvider } from "@/components/ChatXProvider";
import SessionGuard from "@/components/SessionGuard";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "MedX 2.0 - Study Smarter. Achieve More.",
  description: "MEDX 2.0 IS LIVE! Explore new MIST 2026 Videos, Previous Year Topics, Comprehensive Notes, and a brand-new Preparation Tracker. Over 450+ Marrow modules and 370+ new videos added.",
  keywords: ["FMGE", "MedX", "MIST 2026", "Medical preparation", "Marrow modules", "Study Tracker"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedX",
  },
  openGraph: {
    title: "MedX 2.0 - Study Smarter. Achieve More.",
    description: "MEDX 2.0 IS LIVE! Explore new MIST 2026 Videos, Previous Year Topics, and a brand-new Preparation Tracker.",
    url: "https://medx.srihari.quest",
    siteName: "MedX",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "MEDX 2.0 IS LIVE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedX 2.0 - Study Smarter. Achieve More.",
    description: "MEDX 2.0 IS LIVE! Enjoy a massive content drop with 450+ Marrow modules, 370+ new videos, and comprehensive notes for all subjects.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#f0f0f0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="theme-color" content="#f0f0f0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="font-sans antialiased bg-[#f0f0f0] defi-landing">
        <ChatXProvider>
          <SessionGuard />
          
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>

          <MobileNav />
          <Analytics />
          <SpeedInsights />
        </ChatXProvider>
      </body>
    </html>
  );
}
