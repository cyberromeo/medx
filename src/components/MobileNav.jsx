"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/chatx" ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/")
  ) return null;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chatx", icon: MessageSquare },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
    >
      <div className="nav-shell rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${isActive ? "bg-white/5" : "hover:bg-white/5"}`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-muted"} />
                <span className={`text-[10px] font-semibold ${isActive ? "text-white" : "text-muted"}`}>
                  {link.name}
                </span>
                {isActive && (
                  <span className="mt-1 h-[2px] w-6 rounded-full bg-primary shadow-[0_0_12px_rgba(32,227,255,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
