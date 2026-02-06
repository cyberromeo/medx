"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useChatX } from "@/components/ChatXProvider";

export default function MobileNav() {
  const pathname = usePathname();
  const { openChat } = useChatX();

  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/")
  ) return null;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
    >
      <div className="nav-shell rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${pathname.startsWith("/dashboard") ? "bg-white/5" : "hover:bg-white/5"}`}
          >
            <LayoutDashboard size={20} className={pathname.startsWith("/dashboard") ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-semibold ${pathname.startsWith("/dashboard") ? "text-white" : "text-muted"}`}>
              Dashboard
            </span>
            {pathname.startsWith("/dashboard") && (
              <span className="mt-1 h-[2px] w-6 rounded-full bg-primary shadow-[0_0_12px_rgba(32,227,255,0.6)]" />
            )}
          </Link>

          <button
            onClick={openChat}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 hover:bg-white/5"
          >
            <MessageSquare size={20} className="text-muted" />
            <span className="text-[10px] font-semibold text-muted">Discuss</span>
          </button>

          <Link
            href="/leaderboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${pathname.startsWith("/leaderboard") ? "bg-white/5" : "hover:bg-white/5"}`}
          >
            <Trophy size={20} className={pathname.startsWith("/leaderboard") ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-semibold ${pathname.startsWith("/leaderboard") ? "text-white" : "text-muted"}`}>
              Leaderboard
            </span>
            {pathname.startsWith("/leaderboard") && (
              <span className="mt-1 h-[2px] w-6 rounded-full bg-primary shadow-[0_0_12px_rgba(32,227,255,0.6)]" />
            )}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
