"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageSquare, Clock, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on login, landing, chat, watch, and series pages
    if (
        pathname === '/login' ||
        pathname === '/' ||
        pathname === '/chatx' ||
        pathname.startsWith('/watch/') ||
        pathname.startsWith('/series/')
    ) return null;

    const leftItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Profile", href: "/leaderboard", icon: User },
    ];

    const rightItems = [
        { name: "Activity", href: "/dashboard", icon: Clock },
        { name: "Alerts", href: "/dashboard", icon: Bell },
    ];

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = pathname === item.href ||
            (item.href === "/dashboard" && pathname.startsWith("/dashboard"));

        return (
            <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-500'
                    }`}
            >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </Link>
        );
    };

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
            <div className="mx-4 mb-4">
                <div className="bg-[#1a1a2e]/95 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-around py-2 relative">
                        {/* Left Items */}
                        {leftItems.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}

                        {/* Center Floating Button */}
                        <Link
                            href="/chatx"
                            className="relative -mt-8"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform">
                                <MessageSquare size={24} className="text-white" />
                            </div>
                        </Link>

                        {/* Right Items */}
                        {rightItems.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Home indicator safe area */}
            <div className="h-1 bg-transparent" />
        </motion.nav>
    );
}
