"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearProgressCache } from "@/lib/progress";
import {
  Stethoscope,
  ChevronRight,
  Trophy,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useChatX();

  const firstName = useMemo(
    () => (user?.displayName || user?.name)?.trim()?.split(" ")[0] || "Learner",
    [user],
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearProgressCache();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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
      className={`fixed top-3 right-0 left-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 sm:top-4 ${scrolled ? "py-2" : "py-3"}`}
    >
      <div className="container mx-auto px-4">
        <div className="md:hidden">
          <div
            className={`nav-shell flex items-center justify-between rounded-2xl px-4 py-2.5 ${scrolled ? "nav-shell-scrolled" : "border-transparent bg-transparent"}`}
          >
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center gap-2.5"
            >
              <div className="grad-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div>
                <span className="font-display text-base leading-none font-bold">
                  MedX
                </span>
                <p className="text-muted mt-1 text-[10px] leading-none">
                  FMGE Companion
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={openChat}
                    className="hover:text-primary flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                    title="Discuss"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-red-500"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-900"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div
          className={`nav-shell mx-auto hidden max-w-6xl items-center justify-between rounded-full px-5 md:flex ${scrolled ? "nav-shell-scrolled py-2.5" : "border-transparent bg-transparent py-3"}`}
        >
          <Link
            href={user ? "/dashboard" : "/"}
            className="group flex items-center gap-3"
          >
            <div className="grad-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-105">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display text-lg leading-none font-bold tracking-tight">
                MedX
              </span>
              <p className="text-muted mt-1 text-[10px] leading-none">
                Study with precision
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-8">
            {!user &&
              navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="nav-link">
                  {link.name}
                </Link>
              ))}
            {user && (
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                  {firstName.charAt(0)}
                </span>
                Dr. {firstName}
              </span>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={openChat}
                  className="nav-link flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Discuss
                </button>
                <Link
                  href="/leaderboard"
                  className={`nav-link flex items-center gap-2 ${pathname.startsWith("/leaderboard") ? "nav-active" : ""}`}
                >
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
              <Link
                href="/login"
                className={`nav-link ${pathname === "/login" ? "nav-active" : ""}`}
              >
                Sign In
              </Link>
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
