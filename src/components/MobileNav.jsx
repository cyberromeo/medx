"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MobileNav() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 10 || currentScrollY < lastScrollY) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Hide on login page or landing
    if (pathname === '/login' || pathname === '/') return null;

    const navItems = [
        { name: "Home", href: "/dashboard", icon: LayoutDashboard },
        { name: "Chat", href: "/chatx", icon: MessageSquare },
        { name: "Rank", href: "/leaderboard", icon: Trophy },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: isVisible ? 0 : 100 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
            {/* Tiny pill nav - just icons */}
            <nav className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                {navItems.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 active:scale-90 ${isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-gray-500 active:bg-white/5'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />

                            {/* Active dot */}
                            {isActive && (
                                <motion.span
                                    layoutId="navDot"
                                    className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </motion.div>
    );
}
