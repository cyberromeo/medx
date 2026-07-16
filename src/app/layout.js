import "./app.css";
import "./defi-landing.css";
import MobileNav from "@/components/MobileNav";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { ChatXProvider } from "@/components/ChatXProvider";
import SessionGuard from "@/components/SessionGuard";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "MedX - Medical Video Platform",
  description: "Premium FMGE preparation platform",
  manifest: "/manifest.json",
  themeColor: "#f0f0f0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedX",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
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
        </ChatXProvider>
      </body>
    </html>
  );
}
