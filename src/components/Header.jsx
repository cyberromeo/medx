"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Stethoscope, ChevronRight, Trophy, LogOut, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useChatX();

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
    { name: "Roadmap", href: "/#about" },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled ? "top-2 sm:top-3" : "top-3 sm:top-4"}`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Mobile */}
        <div className="md:hidden">
          <div className={`nav-shell rounded-2xl px-3.5 py-2.5 flex items-center justify-between ${scrolled ? "" : "bg-[rgba(10,10,10,0.72)]"}`}>
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg grad-primary flex items-center justify-center">
                <Stethoscope size={17} className="text-black" />
              </div>
              <div>
                <p className="font-display text-base leading-none">MEDX</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Study Lab</p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5">
              {user ? (
                <>
                  <button
                    onClick={openChat}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/8 border border-white/20 text-muted hover:text-white transition-colors"
                    title="Discuss"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/8 border border-white/20 text-muted hover:text-red-300 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide border border-white/25 bg-white/8"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className={`hidden md:flex mx-auto max-w-6xl nav-shell rounded-2xl px-4 lg:px-5 py-3 items-center justify-between ${scrolled ? "" : "bg-[rgba(10,10,10,0.72)]"}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg grad-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope size={18} className="text-black" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">MEDX</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Medical Education</p>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            {!user && navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "nav-active" : ""} text-[11px]`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={openChat} className="nav-link flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Discuss
                </button>
                <Link href="/leaderboard" className="nav-link flex items-center gap-1.5">
                  <Trophy size={16} />
                  Leaderboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center gap-1.5 text-red-300 hover:text-red-200"
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
              className="btn-primary flex items-center gap-2"
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
