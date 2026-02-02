"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Play, Shield, Zap, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden selection:bg-primary/30">
      <div className="mesh-bg" />
      <div className="aurora-bg" />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-24 sm:pb-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Recorded Live Classes Available</span>
            </motion.div>

            <h1 className="hero-text text-4xl sm:text-5xl md:text-7xl mb-6 sm:mb-8">
              Master the <br className="sm:hidden" />
              <span className="text-gradient-animated">Medical Arts</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              The pass percentage is just a number. You only need one seat, one passing score,
              and one &apos;Qualified&apos; status to start your dream career in India.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/login" className="btn-shine flex items-center gap-2 w-full sm:w-auto justify-center text-base">
                Start Learning
                <ArrowRight size={18} />
              </Link>
              <Link href="/syllabus" className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold text-base text-white border border-white/10 hover:bg-white/5 hover:border-primary/30 transition-all w-full sm:w-auto text-center backdrop-blur-sm">
                View Syllabus
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Bento Grid Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14"
          >
            Why Choose <span className="text-gradient">MedX</span>?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

            {/* Large Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 card-premium p-6 sm:p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Cinematic Learning</h3>
                <p className="text-gray-400 mb-6 max-w-md">Experience medical education like never before. 4K anatomical details, immersive surgery walkthroughs, and crystal clear audio.</p>
                <div className="aspect-video bg-black/50 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    <Play size={40} className="text-primary/50" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Friendly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-3xl flex flex-col justify-between group hover:border-primary/30 transition-colors"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Learn Anywhere</h3>
                <p className="text-sm text-gray-500">Fully optimized for mobile, tablet, and desktop. Your library travels with you.</p>
              </div>
            </motion.div>

            {/* Secure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-3xl flex flex-col justify-between group hover:border-accent/30 transition-colors"
            >
              <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
                <p className="text-sm text-gray-500">Enterprise-grade security. Your progress and data are protected.</p>
              </div>
            </motion.div>

            {/* Speed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 glass-panel p-10 rounded-3xl relative overflow-hidden flex items-center justify-between group"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
                <p className="text-gray-400 max-w-xs">Optimized streaming engine ensures zero buffer, even on mobile networks.</p>
              </div>
              <div className="bg-gradient-to-br from-secondary to-primary w-24 h-24 rounded-full blur-[40px] opacity-50 absolute right-10" />
              <Zap size={64} className="text-white relative z-10 group-hover:text-yellow-400 transition-colors" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 MedX - FMGE Preparation Platform</p>
      </footer>
    </main>
  );
}
