"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Menu, X, Stethoscope, ChevronRight, Trophy, LogOut } from "lucide-react";
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
        { name: "ChatX", href: "/chatx" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}
        >
            <div className="container mx-auto px-4">
                <div className={`mx-auto max-w-5xl glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-black/40' : 'bg-transparent border-transparent'}`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                            <Stethoscope size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight group-hover:text-gradient transition-all">MedX</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
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

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-24 left-4 right-4 p-4 glass-panel rounded-2xl md:hidden flex flex-col gap-4 text-center"
                    >
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white py-2">
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-white/10 w-full" />
                        {user ? (
                            <>
                                <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 text-yellow-400 py-3">
                                    <Trophy size={20} />
                                    Leaderboard
                                </Link>
                                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="bg-primary text-black py-3 rounded-xl font-bold">
                                    Go to Dashboard
                                </Link>
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="flex items-center justify-center gap-2 text-red-400 py-3 hover:text-red-300"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 py-2">Sign In</Link>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="bg-white text-black py-3 rounded-xl font-bold">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
