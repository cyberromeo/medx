"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-0 z-50 flex w-full items-center justify-between p-6 md:px-12"
    >
      {/* Mobile/Desktop Logo */}
      <div className="text-xl font-bold tracking-wide text-white">MedX</div>

      {/* Desktop Links (Hidden on mobile) */}
      <div className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
        <Link href="/syllabus" className="transition-colors hover:text-white">
          Syllabus
        </Link>
        <Link
          href="#"
          className="flex items-center gap-1 transition-colors hover:text-white"
        >
          Live Classes <ChevronRight size={14} />
        </Link>
        <Link href="/discuss" className="transition-colors hover:text-white">
          Community
        </Link>
        <Link href="#" className="transition-colors hover:text-white">
          About
        </Link>
      </div>

      {/* Desktop Button (Hidden on mobile) */}
      <div className="hidden md:block">
        <Link href={isLoggedIn ? "/dashboard" : "/login"}>
          <button className="group flex items-center gap-2 rounded-full bg-[#0b1329] px-4 py-2 text-white transition-all duration-300 hover:bg-[#111d3d]">
            <span className="text-sm font-medium">{isLoggedIn ? "Open Dashboard" : "Start Learning"}</span>
            <div className="rounded-full bg-white/20 p-1 transition-transform group-hover:scale-110">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          </button>
        </Link>
      </div>
    </motion.nav>
  );
}
