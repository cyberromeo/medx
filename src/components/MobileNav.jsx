"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, MessageSquare, ClipboardList } from "lucide-react";
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

  const dashboardActive = pathname.startsWith("/dashboard");
  const mcqActive = pathname === "/mcq";
  const leaderboardActive = pathname.startsWith("/leaderboard");

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="bottom-nav-shell rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 ${dashboardActive ? "bottom-nav-item-active" : "hover:bg-white/5"}`}
          >
            <LayoutDashboard size={20} className={dashboardActive ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-semibold ${dashboardActive ? "text-white" : "text-muted"}`}>Dashboard</span>
          </Link>

          <Link
            href="/mcq"
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 ${mcqActive ? "bottom-nav-item-active" : "hover:bg-white/5"}`}
          >
            <ClipboardList size={20} className={mcqActive ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-semibold ${mcqActive ? "text-white" : "text-muted"}`}>MCQs</span>
          </Link>

          <button
            onClick={openChat}
            className="bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 hover:bg-white/5"
          >
            <MessageSquare size={20} className="text-muted" />
            <span className="text-[10px] font-semibold text-muted">Discuss</span>
          </button>

          <Link
            href="/leaderboard"
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 ${leaderboardActive ? "bottom-nav-item-active" : "hover:bg-white/5"}`}
          >
            <Trophy size={20} className={leaderboardActive ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-semibold ${leaderboardActive ? "text-white" : "text-muted"}`}>Rank</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

