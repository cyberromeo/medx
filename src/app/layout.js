import "./app.css";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import MobileNav from "@/components/MobileNav";
import { ChatXProvider } from "@/components/ChatXProvider";
import { Analytics } from "@vercel/analytics/next";

const sora = Sora({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "MedX - Medical Video Platform",
  description: "Premium FMGE preparation platform",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#090820" },
    { media: "(prefers-color-scheme: dark)", color: "#090820" },
  ],
  colorScheme: "dark only",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedX",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#090820" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${manrope.variable} ${sora.variable} ${jetbrains.variable} antialiased`}>
        <ChatXProvider>
          {children}
          <MobileNav />
          <Analytics />
        </ChatXProvider>
      </body>
    </html>
  );
}
