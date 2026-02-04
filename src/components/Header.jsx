"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Stethoscope, ChevronRight, Trophy, LogOut, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    account.get().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "About", href: "/#about" },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled ? "py-2" : "py-3"}`}
    >
      <div className="container mx-auto px-4">
        {/* Mobile */}
        <div className="md:hidden">
          <div className={`nav-shell rounded-2xl px-4 py-2 flex items-center justify-between ${scrolled ? "" : "bg-transparent border-transparent"}`}>
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center shadow-lg">
                <Stethoscope size={18} className="text-black" />
              </div>
              <span className="font-display font-bold text-base">MedX</span>
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className={`hidden md:flex mx-auto max-w-6xl nav-shell rounded-full px-5 py-3 items-center justify-between ${scrolled ? "" : "bg-transparent border-transparent"}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Stethoscope size={18} className="text-black" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">MedX</span>
          </Link>

          <nav className="flex items-center gap-8">
            {!user && navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "nav-active" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/chatx" className="nav-link flex items-center gap-2">
                  <MessageSquare size={16} />
                  ChatX
                </Link>
                <Link href="/leaderboard" className="nav-link flex items-center gap-2">
                  <Trophy size={16} />
                  Leaderboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center gap-2 text-red-300 hover:text-red-400"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link href="/login" className="nav-link">Sign In</Link>
            )}

            <Link
              href={user ? "/dashboard" : "/login"}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {user ? "Open Library" : "Get Started"}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
