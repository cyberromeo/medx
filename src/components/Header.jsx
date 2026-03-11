"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { clearProgressCache } from "@/lib/progress";
import { Stethoscope, ChevronRight, Trophy, LogOut, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useChatX();

  const firstName = useMemo(() => user?.name?.trim()?.split(" ")[0] || "Learner", [user]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      clearProgressCache();
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
      className={`fixed top-3 sm:top-4 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled ? "py-2" : "py-3"}`}
    >
      <div className="container mx-auto px-4">
        <div className="md:hidden">
          <div
            className={`nav-shell rounded-2xl px-4 py-2.5 flex items-center justify-between ${scrolled ? "nav-shell-scrolled" : "bg-transparent border-transparent"}`}
          >
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center shadow-lg">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-base leading-none">MedX</span>
                <p className="text-[10px] text-muted leading-none mt-1">FMGE Companion</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={openChat}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-primary hover:bg-white/10 transition-colors"
                    title="Discuss"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div
          className={`hidden md:flex mx-auto max-w-6xl nav-shell rounded-full px-5 items-center justify-between ${scrolled ? "nav-shell-scrolled py-2.5" : "py-3 bg-transparent border-transparent"}`}
        >
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight leading-none">MedX</span>
              <p className="text-[10px] text-muted leading-none mt-1">Study with precision</p>
            </div>
          </Link>

          <nav className="flex items-center gap-8">
            {!user &&
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="nav-link"
                >
                  {link.name}
                </Link>
              ))}
            {user && (
              <span className="nav-user-pill">
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px]">
                  {firstName.charAt(0)}
                </span>
                Dr. {firstName}
              </span>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={openChat} className="nav-link flex items-center gap-2">
                  <MessageSquare size={16} />
                  Discuss
                </button>
                <Link href="/leaderboard" className={`nav-link flex items-center gap-2 ${pathname.startsWith("/leaderboard") ? "nav-active" : ""}`}>
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
              <Link href="/login" className={`nav-link ${pathname === "/login" ? "nav-active" : ""}`}>
                Sign In
              </Link>
            )}

            <Link href={user ? "/dashboard" : "/login"} className="btn-primary flex items-center gap-2 text-sm">
              {user ? "Open Library" : "Get Started"}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

