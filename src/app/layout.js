import "./app.css";
import { Inter, Outfit } from "next/font/google";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "MedX - Medical Video Platform",
  description: "Premium FMGE preparation platform",
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
  other: {
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground`}>
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
