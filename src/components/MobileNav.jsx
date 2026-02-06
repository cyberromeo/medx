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
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-[calc(env(safe-area-inset-bottom)+10px)]"
    >
      <div className="nav-shell rounded-2xl px-2.5 py-2">
        <div className="flex items-center justify-around gap-1">
          <Link
            href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 border ${pathname.startsWith("/dashboard")
              ? "bg-white/10 border-white/25"
              : "border-transparent hover:bg-white/5"
              }`}
          >
            <LayoutDashboard size={18} className={pathname.startsWith("/dashboard") ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-bold tracking-wide uppercase ${pathname.startsWith("/dashboard") ? "text-white" : "text-muted"}`}>
              Dashboard
            </span>
            {pathname.startsWith("/dashboard") && (
              <span className="mt-0.5 h-[2px] w-6 rounded-full bg-primary shadow-[0_0_12px_rgba(30,200,255,0.6)]" />
            )}
          </Link>

          <button
            onClick={openChat}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 border border-white/25 bg-[linear-gradient(145deg,rgba(30,200,255,0.18),rgba(238,255,59,0.16))]"
          >
            <MessageSquare size={18} className="text-white" />
            <span className="text-[10px] font-bold tracking-wide uppercase text-white">Discuss</span>
          </button>

          <Link
            href="/leaderboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 border ${pathname.startsWith("/leaderboard")
              ? "bg-white/10 border-white/25"
              : "border-transparent hover:bg-white/5"
              }`}
          >
            <Trophy size={18} className={pathname.startsWith("/leaderboard") ? "text-primary" : "text-muted"} />
            <span className={`text-[10px] font-bold tracking-wide uppercase ${pathname.startsWith("/leaderboard") ? "text-white" : "text-muted"}`}>
              Leaderboard
            </span>
            {pathname.startsWith("/leaderboard") && (
              <span className="mt-0.5 h-[2px] w-6 rounded-full bg-primary shadow-[0_0_12px_rgba(30,200,255,0.6)]" />
            )}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
