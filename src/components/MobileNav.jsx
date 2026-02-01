"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Trophy, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

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

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden safe-bottom transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
            <nav className="glass-panel mx-auto flex items-center justify-around px-2 py-3 rounded-2xl backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl">
                {[
                    { name: "Home", href: "/", icon: Home },
                    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                    { name: "ChatX", href: "/chatx", icon: MessageSquare },
                    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
                ].map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full transition-opacity duration-300 ${isActive ? 'opacity-50' : 'opacity-0'}`} />
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
