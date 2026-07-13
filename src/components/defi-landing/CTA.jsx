"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";

export default function CTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="mb-12 flex w-full items-center justify-center bg-[#f0f0f0] p-3 md:p-5">
      <section className="relative flex min-h-[60vh] w-full max-w-[1536px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#f0f0f0] md:min-h-[80vh] md:rounded-[3rem]">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-70"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_104731_bfd355f7-1f84-4f81-ad88-52c2bca70bad.mp4"
            type="video/mp4"
          />
        </video>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 flex max-w-3xl flex-col items-center px-4 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-10 text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl"
          >
            Start your dream career in India today.
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <button className="group flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-gray-900 shadow-xl transition-all hover:bg-gray-100 md:px-8 md:py-4">
              Start Learning
              <div className="rounded-full bg-gray-200 p-1 transition-transform group-hover:scale-110">
                <ArrowUpRight size={16} className="text-gray-900" />
              </div>
            </button>
            <button className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/20 md:px-8 md:py-4">
              <BookOpen
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              View Syllabus
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
