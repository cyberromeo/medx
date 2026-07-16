"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Video,
  ClipboardList,
  Trophy,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearProgressCache } from "@/lib/progress";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useChatX();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/syllabus" ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/") ||
    (pathname.startsWith("/mcq/") && pathname !== "/mcq")
  ) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearProgressCache();
      setUser(null);
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, id: "dashboard" },
    { href: "/series", icon: Video, id: "series" },
    { href: "/mcq", icon: ClipboardList, id: "mcq" },
    { href: "/tracker", icon: Activity, id: "tracker" },
    { action: openChat, icon: MessageSquare, id: "chat" },
  ];

  const avatarUrl =
    user?.photoURL ||
    `https://api.dicebear.com/10.x/glyphs/svg?seed=${user?.uid || "guest"}`;

  return (
    <>
      {/* Integrated bottom nav */}
      <nav className="flex w-full items-center justify-around px-2 py-3 bg-white">
          {navItems.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;

            const content = (
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "scale-110 text-blue-600"
                      : "text-gray-400"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-600"
                  />
                )}
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center justify-center outline-none"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center outline-none"
              >
                {content}
              </button>
            );
          })}

          {/* Profile button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center outline-none"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isMenuOpen ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="h-7 w-7 overflow-hidden rounded-full border border-[rgba(30,50,90,0.1)] shadow-sm">
                {user ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full bg-white object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>
            </div>
          </button>
      </nav>

      {/* Slide-out menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[82%] max-w-[340px] flex-col overflow-hidden bg-[#f0f0f0] shadow-2xl md:hidden"
            >
              {/* Header */}
              <div className="flex justify-between border-b border-[rgba(30,50,90,0.06)] bg-white px-6 pb-6 pt-14">
                <div className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-blue-100 shadow-sm">
                    {user && (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-gray-900">
                      {user?.displayName || "Doctor"}
                    </h2>
                    <p className="max-w-[180px] truncate text-sm text-gray-500">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-transform active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu options */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {[
                  {
                    href: "/dashboard",
                    icon: LayoutGrid,
                    label: "Dashboard",
                  },
                  { href: "/series", icon: Video, label: "Video Library" },
                  { href: "/mcq", icon: ClipboardList, label: "MCQ Practice" },
                  { href: "/tracker", icon: Activity, label: "Tracker" },
                  {
                    href: "/leaderboard",
                    icon: Trophy,
                    label: "Leaderboard",
                  },
                  {
                    href: "/settings",
                    icon: Settings,
                    label: "Settings",
                  },
                ].map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <option.icon size={20} />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {option.label}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-[rgba(30,50,90,0.06)] bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-600 transition-transform active:scale-[0.98]"
                >
                  <LogOut size={20} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}