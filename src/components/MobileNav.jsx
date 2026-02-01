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

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if at top or scrolling up
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

    // Don't show on login page or admin
    if (pathname === '/login' || pathname.startsWith('/admin')) return null;

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Library", href: "/dashboard", icon: LayoutDashboard },
        { name: "Chat", href: "/chatx", icon: MessageSquare },
        { name: "Rank", href: "/leaderboard", icon: Trophy },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: isVisible ? 0 : 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden safe-bottom"
        >
            <nav className="mx-auto max-w-sm flex items-center justify-around px-2 py-2 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
                {navItems.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${isActive
                                    ? 'text-primary'
                                    : 'text-gray-500 active:text-gray-300'
                                }`}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <motion.div
                                    layoutId="navIndicator"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                            />

                            <span className={`text-[10px] mt-1 relative z-10 font-medium ${isActive ? 'text-primary' : 'text-gray-600'
                                }`}>
                                {link.name}
                            </span>

                            {/* Active dot indicator */}
                            {isActive && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </motion.div>
    );
}
