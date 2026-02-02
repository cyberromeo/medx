"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on login, landing, chat, watch, and series pages
    // User requested chat buttons in video, but usually nav bar is hidden to prevent overlap
    // If user wants nav bar in video, we need to handle it carefully. 
    // For now, I'll keep it hidden on video pages to avoid "hiding content" issues, 
    // as the specific complaint "nav bar still hides some content" usually implies overlap.
    if (
        pathname === '/login' ||
        pathname === '/' ||
        pathname === '/chatx' ||
        pathname.startsWith('/watch/') ||
        pathname.startsWith('/series/')
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
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden bottom-nav"
        >
            <div className="nav-pill-glow rounded-2xl shadow-2xl p-1">
                <div className="flex items-center justify-around">
                    {navItems.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95 nav-item ${isActive
                                    ? 'nav-item-active text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                                <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </motion.nav>
    );
}
