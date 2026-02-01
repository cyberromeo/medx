"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on login page or landing
    if (pathname === '/login' || pathname === '/') return null;

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Chat", href: "/chatx", icon: MessageSquare },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    ];

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
            {/* Clean glass dock */}
            <div className="bg-black/90 backdrop-blur-2xl border-t border-white/10 safe-bottom">
                <div className="flex items-stretch justify-around">
                    {navItems.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 active:scale-95 ${isActive
                                        ? 'text-primary'
                                        : 'text-gray-500 active:text-gray-400'
                                    }`}
                            >
                                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="navGlow"
                                            className="absolute -inset-2 bg-primary/20 rounded-full blur-md -z-10"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
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
