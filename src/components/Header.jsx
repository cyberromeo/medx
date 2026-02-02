"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Menu, X, Stethoscope, ChevronRight, Trophy, LogOut, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        account.get().then(setUser).catch(() => setUser(null));
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "/#features" },
        { name: "About", href: "/#about" },
    ];

    return (
        <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}
        >
            <div className="container mx-auto px-4 md:px-4">
                {/* Mobile: Clean full-width header */}
                <div className="md:hidden">
                    <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 ${scrolled
                        ? 'bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/40'
                        : 'bg-black/40 backdrop-blur-xl border border-white/5'
                        }`}>
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/20 float-enhanced">
                                <Stethoscope size={18} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-lg text-white">MedX</span>
                        </Link>

                        {user && (
                            <button
                                onClick={handleLogout}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95 focus-ring"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>


                {/* Desktop: Full header */}
                <div className={`hidden md:flex mx-auto max-w-5xl nav-pill-glow rounded-full px-6 py-3 items-center justify-between transition-all duration-300 ${scrolled ? 'bg-black/85' : 'bg-black/70'}`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-lg group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(0,240,255,0.55)] transition-all duration-300 float-enhanced">
                            <Stethoscope size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight group-hover:text-gradient transition-all">MedX</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="flex items-center gap-8">
                        {!user && navLinks.map(link => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline-animate"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link href="/chatx" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors underline-animate">
                                    <MessageSquare size={18} />
                                    <span className="text-sm font-medium">ChatX</span>
                                </Link>
                                <Link href="/leaderboard" className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors underline-animate">
                                    <Trophy size={18} />
                                    <span className="text-sm font-medium">Leaderboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors pl-4 border-l border-white/10"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline-animate">
                                Sign In
                            </Link>
                        )}

                        <Link
                            href={user ? "/dashboard" : "/login"}
                            className="btn-shine text-sm flex items-center gap-2"
                        >
                            {user ? 'Watch' : 'Get Started'}
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - removed, using bottom nav instead */}
        </motion.header>
    );
}
