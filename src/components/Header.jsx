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

    // Compact mobile header - just logo pill
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}
        >
            <div className="container mx-auto px-3 md:px-4">
                {/* Mobile: Compact pill header */}
                <div className="md:hidden flex justify-center">
                    <Link
                        href={user ? "/dashboard" : "/"}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${scrolled
                                ? 'bg-black/70 backdrop-blur-xl border border-white/10'
                                : 'bg-black/40 backdrop-blur-md border border-transparent'
                            }`}
                    >
                        <div className="bg-gradient-to-tr from-primary to-secondary p-1.5 rounded-lg">
                            <Stethoscope size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-sm text-white">MedX</span>
                    </Link>
                </div>

                {/* Desktop: Full header */}
                <div className={`hidden md:flex mx-auto max-w-5xl glass rounded-full px-6 py-3 items-center justify-between transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl' : 'bg-black/20 border-transparent'}`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                            <Stethoscope size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight group-hover:text-gradient transition-all">MedX</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="flex items-center gap-8">
                        {!user && navLinks.map(link => (
                            <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link href="/chatx" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                                    <MessageSquare size={18} />
                                    <span className="text-sm font-medium">ChatX</span>
                                </Link>
                                <Link href="/leaderboard" className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
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
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Sign In
                            </Link>
                        )}

                        <Link
                            href={user ? "/dashboard" : "/login"}
                            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
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
