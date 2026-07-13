"use client";

import { motion } from "framer-motion";
import { Layers, Activity, ArrowUpRight } from "lucide-react";

export default function Features() {
  return (
    <section className="mx-auto w-full max-w-[1536px] px-3 py-12 md:px-5 md:py-24">
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
        <h2 className="max-w-xl text-3xl leading-tight font-bold text-gray-900 md:text-5xl">
          Why Choose MedX
        </h2>
        <button className="rounded-full border-2 border-gray-900 px-6 py-3 font-semibold text-gray-900 transition-colors duration-300 hover:bg-gray-900 hover:text-white">
          Start Learning
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6">
        {/* Card 1 (Tall Left) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative flex min-h-[28rem] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-white p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:row-span-2 md:rounded-[2rem] md:p-12"
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900 opacity-[0.02] transition-transform duration-700 group-hover:scale-110">
            <Layers size={400} strokeWidth={1} />
          </div>
          <h3 className="relative z-10 max-w-xs text-3xl font-bold text-gray-900 md:text-4xl">
            Cinematic Learning Experience
          </h3>
          <p className="relative z-10 max-w-xs text-lg font-medium text-gray-500">
            Experience medical education like never before. Crisp anatomy
            visuals, immersive walkthroughs, and studio-grade sound.
          </p>
        </motion.div>

        {/* Card 2 (Wide Top Right) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="group relative flex min-h-[16rem] flex-col justify-center overflow-hidden rounded-[1.5rem] bg-white p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-2 md:rounded-[2rem] md:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -bottom-20 text-gray-900 opacity-[0.02] transition-transform duration-700 group-hover:scale-110">
            <Activity size={350} strokeWidth={1} />
          </div>
          <h3 className="relative z-10 mb-4 max-w-md text-3xl font-bold text-gray-900 md:text-4xl">
            Studio-Quality Audio
          </h3>
          <p className="relative z-10 max-w-md text-lg font-medium text-gray-500">
            Hear every detail with crystal clear audio, designed to keep you
            focused.
          </p>
        </motion.div>

        {/* Card 3 (Bottom Right 1) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-white p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:rounded-[2rem]"
        >
          <div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Zero Buffering
            </h3>
            <p className="font-medium text-gray-500">
              Our infrastructure ensures seamless streaming across all devices.
            </p>
          </div>
          <button className="mt-6 self-start rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
            Test Stream
          </button>
        </motion.div>

        {/* Card 4 (Bottom Right 2) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="group relative flex min-h-[16rem] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] bg-white p-8 text-center transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:rounded-[2rem]"
        >
          <h3 className="mb-6 w-full text-left text-2xl font-bold text-gray-900">
            Cross-Platform
          </h3>
          <div className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-all duration-500 group-hover:scale-110 group-hover:bg-gray-200">
            <ArrowUpRight
              size={32}
              className="text-gray-700 transition-colors group-hover:text-gray-900"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
