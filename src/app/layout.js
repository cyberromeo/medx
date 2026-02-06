import "./app.css";
import { Anton, Space_Grotesk, Caveat, JetBrains_Mono } from "next/font/google";
import MobileNav from "@/components/MobileNav";
import { ChatXProvider } from "@/components/ChatXProvider";
import { Analytics } from "@vercel/analytics/next";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-chalk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "MedX - Medical Video Platform",
  description: "Modern medical education video platform",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#050505" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
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
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${spaceGrotesk.variable} ${anton.variable} ${caveat.variable} ${jetbrains.variable} antialiased`}>
        <ChatXProvider>
          {children}
          <MobileNav />
          <Analytics />
        </ChatXProvider>
      </body>
    </html>
  );
}
