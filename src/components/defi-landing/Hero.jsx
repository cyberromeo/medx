"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Navbar from "./Navbar";
import InstallPrompt from "../InstallPrompt";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f0f0f0] p-3 md:p-5">
      <section className="group relative flex h-full w-full max-w-[1536px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] bg-gray-100 md:rounded-[3rem]">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay to ensure text readability if needed (optional) */}
        <div className="absolute inset-0 z-0 bg-gray-100/50"></div>

        {/* Navbar */}
        <Navbar />

        {/* Main Content Block */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 -mt-48 flex max-w-4xl flex-col items-center px-4 text-center md:-mt-80"
        >
          {/* HeroBadge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-md"
          >
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">
              Cinematic Learning
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-5 text-4xl font-bold tracking-tight text-[#5E6470] drop-shadow-sm md:text-5xl lg:text-7xl"
          >
            Build a world-class
            <br />
            medical foundation
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-base font-medium text-white/90 drop-shadow-md md:text-lg"
          >
            The pass percentage is just a number. You only need one seat, one
            passing score, and one Qualified status to start your dream career.
          </motion.p>
        </motion.div>

        {/* Bottom Left Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-6 left-6 z-20 flex flex-col items-start gap-4 rounded-2xl border border-white/20 bg-white/30 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center md:bottom-10 md:left-10"
        >
          <div className="text-white">
            <p className="text-2xl font-bold">1000+</p>
            <p className="text-sm font-medium text-white/80">
              Hours of Content
            </p>
          </div>
          <InstallPrompt>
            <button className="cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100">
              Install App
            </button>
          </InstallPrompt>
        </motion.div>

        {/* Bottom Right Corner Cut-out */}
        <Link href={isLoggedIn ? "/dashboard" : "/login"} className="absolute right-0 bottom-0 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="group/corner flex cursor-pointer items-center gap-4 rounded-tl-[3.5rem] bg-[#f0f0f0] p-6 pt-8 pl-14"
          >
            {/* SVG Corner Tricks */}
            <svg
              className="absolute -top-[3.5rem] right-0 h-[3.5rem] w-[3.5rem]"
              viewBox="0 0 56 56"
              fill="none"
            >
              <path
                d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z"
                fill="#f0f0f0"
              />
            </svg>
            <svg
              className="absolute bottom-0 -left-[3.5rem] h-[3.5rem] w-[3.5rem]"
              viewBox="0 0 56 56"
              fill="none"
            >
              <path
                d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z"
                fill="#f0f0f0"
              />
            </svg>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 transition-all duration-300 group-hover/corner:scale-110 group-hover/corner:bg-gray-300">
              <ArrowUpRight size={20} className="text-gray-700" />
            </div>
            <span className="font-semibold text-gray-800">{isLoggedIn ? "Open" : "Login"}</span>
          </motion.div>
        </Link>
      </section>
    </div>
  );
}

