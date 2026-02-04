"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Play, Shield, Zap, Globe, ArrowRight, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="halo-bg" />
      <div className="grid-bg" />
      <Header />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative">
          <div className="hero-sweep" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary pulse-soft" />
                <span className="text-xs text-muted font-semibold">Recorded Live Classes Available</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Build a
                <span className="text-gradient"> world-class</span> medical foundation
              </h1>

              <p className="text-base sm:text-lg text-muted mt-4 max-w-xl">
                The pass percentage is just a number. You only need one seat, one passing score,
                and one Qualified status to start your dream career in India.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                <Link href="/login" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-sm">
                  Start Learning
                  <ArrowRight size={16} />
                </Link>
                <Link href="/syllabus" className="btn-ghost w-full sm:w-auto text-center text-sm">
                  View Syllabus
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="stat-card">
                  <p className="text-xs text-muted">Subjects</p>
                  <p className="text-lg font-bold">19</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted">Hours</p>
                  <p className="text-lg font-bold">1000+</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted">Community</p>
                  <p className="text-lg font-bold">Live</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="panel-glow rounded-3xl p-6 lg:p-8 relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary-soft blur-3xl" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="chip">MedX Preview</span>
                  <span className="text-xs text-muted">4K lectures</span>
                </div>
                <div className="aspect-video rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
                  <Play size={36} className="text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="surface-elev rounded-2xl p-3">
                    <p className="text-xs text-muted">Streaming</p>
                    <p className="text-sm font-semibold">Zero buffer</p>
                  </div>
                  <div className="surface-elev rounded-2xl p-3">
                    <p className="text-xs text-muted">Audio</p>
                    <p className="text-sm font-semibold">Studio quality</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-bold text-center mb-10"
          >
            Why Choose <span className="text-gradient">MedX</span>
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 panel-glow rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Play size={120} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Cinematic Learning</h3>
              <p className="text-muted mb-6 max-w-md">
                Experience medical education like never before. Crisp anatomy visuals, immersive walkthroughs,
                and studio-grade sound.
              </p>
              <div className="aspect-video bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center">
                <Play size={40} className="text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="panel rounded-3xl p-6 flex flex-col justify-between"
            >
              <div className="bg-primary-soft w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Learn Anywhere</h3>
                <p className="text-sm text-muted">Optimized for mobile, tablet, and desktop. Your library travels with you.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="panel rounded-3xl p-6 flex flex-col justify-between"
            >
              <div className="bg-accent-soft w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
                <p className="text-sm text-muted">Enterprise-grade security. Your progress and data stay protected.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 panel rounded-3xl p-8 relative overflow-hidden flex items-center justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
                <p className="text-muted max-w-xs">Optimized streaming engine ensures zero buffer, even on mobile networks.</p>
              </div>
              <div className="bg-secondary-soft w-24 h-24 rounded-full blur-[40px] opacity-70 absolute right-10" />
              <Zap size={64} className="text-white relative z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-12 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="panel rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-3">About MedX</h2>
            <p className="text-muted leading-relaxed">
              MedX is a free, student-first platform built to help FMGE aspirants master the full medical
              curriculum with clarity and confidence. Learn at your pace, track progress, and join the community.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 sm:px-6 relative z-10 border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                <AlertTriangle className="text-accent" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Important Disclaimer</h3>
                <p className="text-sm text-muted">Please read the following terms carefully before using MedX.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="surface-elev rounded-2xl p-4">
                <p className="font-semibold mb-2">Zero Cost Policy</p>
                <p className="text-muted">
                  MedX is, and will always be, free to use. If anyone charged you to access this platform,
                  that transaction is not affiliated with us.
                </p>
              </div>
              <div className="surface-elev rounded-2xl p-4">
                <p className="font-semibold mb-2">Content Source</p>
                <p className="text-muted">
                  Video links are curated from public sources. MedX does not host or own the media content.
                </p>
              </div>
              <div className="surface-elev rounded-2xl p-4">
                <p className="font-semibold mb-2">DMCA Requests</p>
                <p className="text-muted">
                  If you are a copyright owner, contact us for prompt takedown processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-muted text-sm">
        <p>(c) 2026 MedX - FMGE Preparation Platform</p>
      </footer>
    </main>
  );
}
