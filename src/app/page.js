"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Stethoscope,
  Zap,
} from "lucide-react";

export default function Home() {
  const moduleRows = [
    { name: "Rapid Revision Anatomy", progress: 82, duration: "18 videos" },
    { name: "Neuro + Psychiatry Sprint", progress: 61, duration: "12 videos" },
    { name: "FMGE PYQ Dissection", progress: 33, duration: "9 videos" },
  ];

  const quickStats = [
    { label: "Current Streak", value: "29", suffix: "days" },
    { label: "Today Focus", value: "2.5", suffix: "hrs" },
    { label: "Retention", value: "91", suffix: "%" },
  ];

  const heat = [
    1, 0, 2, 3, 2, 1, 0,
    2, 3, 4, 3, 2, 1, 1,
    1, 2, 4, 4, 3, 2, 1,
    0, 1, 2, 3, 4, 3, 1,
    1, 2, 3, 3, 2, 2, 0,
    2, 3, 4, 4, 3, 1, 0,
    1, 2, 3, 4, 3, 2, 1,
  ];

  return (
    <main className="min-h-screen relative overflow-hidden pb-16 sm:pb-20">
      <div className="halo-bg" />
      <div className="grid-bg" />
      <Header />

      <section className="relative pt-24 sm:pt-32 px-3 sm:px-6">
        <div className="container mx-auto max-w-6xl relative neo-shell p-4 sm:p-8 overflow-hidden">
          <div className="hero-sweep" />
          <div className="absolute right-4 sm:right-8 top-5 sm:top-7 chalk-note rotate-[-5deg]">
            * mobile-first study cockpit
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 neo-chip mb-4 sm:mb-5">
                <Sparkles size={12} className="text-secondary" />
                Dark Mode Neo-Brutalism
              </div>

              <h1 className="font-display text-[2.7rem] leading-[0.9] sm:text-[4.6rem] lg:text-[5.2rem]">
                MEDX
                <br />
                <span className="text-gradient">STUDY</span> FORCE
              </h1>

              <p className="text-sm sm:text-base text-muted mt-4 max-w-xl">
                A high-velocity medical education platform engineered for deep work.
                Track modules, protect streaks, and run active recall from one brutalist command center.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6 sm:mt-7">
                <Link href="/login" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                  Enter MedX
                  <ArrowRight size={16} />
                </Link>
                <Link href="/syllabus" className="btn-ghost w-full sm:w-auto text-center">
                  Explore Syllabus
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="chip">19 Subjects</span>
                <span className="chip">1000+ Lecture Hours</span>
                <span className="chip">Live Discuss</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="neo-card p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="chip">Today Queue</div>
                <div className="text-[11px] text-muted uppercase tracking-widest">2h 46m left</div>
              </div>
              <div className="aspect-video rounded-xl border-2 border-white/20 bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,200,255,0.24),transparent_50%)]" />
                <div className="w-14 h-14 rounded-full border-2 border-white/35 bg-white/8 flex items-center justify-center relative z-10">
                  <Play size={24} className="text-white ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Current Module</span>
                  <span className="text-secondary font-bold">Cardio Emergencies</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "68%" }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="px-3 sm:px-6 mt-4 sm:mt-5">
        <div className="container mx-auto max-w-6xl bento-grid">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card p-4 sm:p-5 bento-col-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl sm:text-3xl">Video Course Modules</h2>
              <BookOpenText size={20} className="text-primary" />
            </div>
            <div className="space-y-3.5">
              {moduleRows.map((module) => (
                <div key={module.name} className="surface p-3 sm:p-3.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <p className="font-semibold text-white">{module.name}</p>
                    <span className="text-muted">{module.duration}</span>
                  </div>
                  <div className="progress-track mt-2">
                    <div className="progress-fill" style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="chalk-note mt-3 rotate-[-2deg]">* tap any module to resume from exact timestamp</p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="neo-card neo-card-yellow p-4 sm:p-5 bento-col-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Key Stats</h2>
              <Zap size={18} className="text-secondary" />
            </div>
            <div className="space-y-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="surface-elev px-3 py-2.5">
                  <p className="text-[11px] text-muted uppercase tracking-widest">{stat.label}</p>
                  <p className="font-display text-3xl leading-none mt-1">
                    <span className="chalk-scribble inline-block">{stat.value}</span>
                    <span className="text-sm text-muted ml-1.5">{stat.suffix}</span>
                  </p>
                </div>
              ))}
            </div>
            <p className="chalk-note text-right mt-2 rotate-[3deg]">circle this number daily</p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="neo-card p-4 sm:p-5 bento-col-3"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Study Streak Heatmap</h2>
              <Flame size={18} className="text-secondary" />
            </div>
            <div className="grid grid-cols-7 gap-1.5 w-fit">
              {heat.map((level, idx) => (
                <div
                  key={`${level}-${idx}`}
                  className={`heat-cell ${level > 0 ? `level-${Math.min(level, 4)}` : ""}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-sm bg-primary" />
              Consistent study days
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="neo-card p-4 sm:p-5 bento-col-3 flash-stack"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Flashcard Widget</h2>
              <Brain size={18} className="text-primary" />
            </div>
            <div className="surface px-3.5 py-4">
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Quick Recall</p>
              <p className="text-sm leading-relaxed">
                Most common complication in chronic untreated HTN?
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn-outline">Stroke</button>
                <button className="btn-ghost">HFpEF</button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Deck 4 / 12</span>
              <span className="chalk-underline">memory active</span>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="neo-card p-4 sm:p-5 bento-col-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl">Productivity Sprint</h2>
                <p className="text-sm text-muted mt-1">Everything optimized for hand-held studying.</p>
              </div>
              <div className="kpi-pill">Realtime Pace +12%</div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="surface p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-soft border border-primary-soft flex items-center justify-center">
                  <Clock3 size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Session</p>
                  <p className="font-semibold text-sm">42 min focus</p>
                </div>
              </div>
              <div className="surface p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary-soft border border-secondary flex items-center justify-center">
                  <Stethoscope size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Weak Topic</p>
                  <p className="font-semibold text-sm">Endocrine</p>
                </div>
              </div>
              <div className="surface p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-soft border border-white/20 flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Recall</p>
                  <p className="font-semibold text-sm">91% today</p>
                </div>
              </div>
            </div>
            <p className="chalk-note mt-3 rotate-[-2deg]">
              * stacked to fit one-thumb navigation on phones
            </p>
          </motion.article>
        </div>
      </section>

      <section id="about" className="px-3 sm:px-6 mt-4">
        <div className="container mx-auto max-w-6xl neo-shell p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl">Built for velocity</h3>
              <p className="text-sm text-muted mt-2 max-w-2xl">
                MedX combines structured video modules, active recall, and streak accountability into one
                consistent mobile workflow for FMGE aspirants.
              </p>
            </div>
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              Open Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted text-xs uppercase tracking-[0.2em]">
        <p>2026 MedX Learning System</p>
      </footer>
    </main>
  );
}
