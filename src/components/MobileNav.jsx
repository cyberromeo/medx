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
  Hexagon,
  LogOut,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearProgressCache } from "@/lib/progress";
import Image from "next/image";

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

  const avatarUrl = user?.photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${user?.uid || 'guest'}`;

  return (
    <>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed bottom-6 left-4 right-4 z-40 md:hidden flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-none"
      >
        <div className="bg-[#1c1d29]/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl px-4 py-3 flex items-center justify-between w-full max-w-[360px] pointer-events-auto border border-white/10 relative">
          {navItems.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;

            const content = (
              <div className={`relative flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 ${isActive ? "bg-white/10" : ""}`}>
                <item.icon
                  size={24}
                  className={`transition-all duration-300 ${isActive ? "text-blue-500 scale-110" : "text-[#898989] hover:text-white"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                )}
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className="flex flex-col items-center justify-center outline-none">
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.id} onClick={item.action} className="flex flex-col items-center justify-center outline-none">
                {content}
              </button>
            );
          })}
          
          {/* Avatar Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center outline-none relative"
          >
            <div className={`relative flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 ${isMenuOpen ? "bg-white/10" : ""}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#898989] transition-all duration-300">
                {user ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover bg-white" />
                ) : (
                  <div className="w-full h-full bg-[#303030]"></div>
                )}
              </div>
              {isMenuOpen && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
              )}
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-4/5 max-w-[320px] bg-[#f0f0f0] z-50 shadow-2xl flex flex-col md:hidden overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-white border-b border-[#898989]/10 pt-12 flex justify-between items-start">
                <div className="flex flex-col gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-50 bg-white shadow-sm">
                    {user && <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#303030]">
                      {user?.displayName || "Doctor"}
                    </h2>
                    <p className="text-sm text-[#898989] truncate max-w-[200px]">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-[#898989]/10 text-[#303030] rounded-full active:scale-95 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Options */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard", color: "text-blue-500", bg: "bg-blue-50" },
                  { href: "/series", icon: Video, label: "Video Library", color: "text-indigo-500", bg: "bg-indigo-50" },
                  { href: "/mcq", icon: ClipboardList, label: "MCQ Practice", color: "text-green-500", bg: "bg-green-50" },
                  { href: "/tracker", icon: Activity, label: "Tracker", color: "text-rose-500", bg: "bg-rose-50" },
                  { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-500", bg: "bg-amber-50" },
                  { href: "/settings", icon: Hexagon, label: "Settings", color: "text-[#898989]", bg: "bg-[#f0f0f0]" },
                ].map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-[#898989]/10 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${option.bg} ${option.color}`}>
                        <option.icon size={20} />
                      </div>
                      <span className="font-bold text-[#303030]">{option.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-[#898989]" />
                  </Link>
                ))}
              </div>

              {/* Footer / Logout */}
              <div className="p-4 bg-white border-t border-[#898989]/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 active:scale-[0.98] transition-transform"
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
