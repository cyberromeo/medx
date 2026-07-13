"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Video,
  ClipboardList,
  Trophy,
  MessageSquare,
  Activity,
  Hexagon
} from "lucide-react";
import { motion } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";

export default function MobileNav() {
  const pathname = usePathname();
  const { openChat } = useChatX();

  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/") ||
    (pathname.startsWith("/mcq/") && pathname !== "/mcq")
  ) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, id: "dashboard" },
    { href: "/series", icon: Video, id: "series" },
    { href: "/mcq", icon: ClipboardList, id: "mcq" },
    { href: "/tracker", icon: Activity, id: "tracker" },
    { action: openChat, icon: MessageSquare, id: "chat" },
    { href: "/leaderboard", icon: Trophy, id: "leaderboard" },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-none"
    >
      <div className="bg-[#1c1d29] rounded-[2rem] shadow-2xl px-4 py-3 flex items-center justify-between w-full max-w-[420px] pointer-events-auto border border-white/10 relative">
        {navItems.map((item) => {
          const isActive = item.href ? pathname.startsWith(item.href) : false;

          return (
            <div key={item.id} className="relative flex items-center justify-center h-12 w-12">
              {isActive ? (
                <div className="absolute -top-[24px] bg-[#f0f0f0] p-1.5 rounded-full z-10 shadow-sm">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"
                    >
                      <item.icon size={22} strokeWidth={2.5} />
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md"
                    >
                      <item.icon size={22} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-full h-full"
                >
                  <item.icon size={22} />
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-full h-full"
                >
                  <item.icon size={22} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.nav>
  );
}
