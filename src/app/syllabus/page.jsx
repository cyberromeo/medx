"use client";

import "../defi-landing.css";
import { motion } from "framer-motion";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Activity,
  Microscope,
  Stethoscope,
  Baby,
  Brain,
  Heart,
  Syringe,
  Pill,
  Users,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/defi-landing/Footer";

// We won't use the absolute Navbar here to keep the flow simple, instead we add a minimal back navigation
export default function SyllabusPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="defi-landing min-h-screen bg-[#f0f0f0]">
      {/* Simple Header */}
      <div className="mx-auto w-full max-w-[1536px] px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>

      <section className="relative z-10 px-4 pb-24 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8 mb-16 text-center"
          >
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
              FMGE Syllabus
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-gray-500">
              Based on the Graduate Medical Education Regulations issued by the
              National Medical Commission. The exam assesses knowledge from the
              entire MBBS curriculum.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <FileText className="text-gray-900" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                300 MCQs
              </h3>
              <p className="font-medium text-gray-500">
                Divided into two parts. Each part contains 150 questions.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Clock className="text-gray-900" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                150 Minutes
              </h3>
              <p className="font-medium text-gray-500">
                Time allocated for each part. Total duration is 300 minutes.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <CheckCircle2 className="text-gray-900" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                Pass: 150/300
              </h3>
              <p className="font-medium text-gray-500">
                No negative marking. Score 150 or above to qualify.
              </p>
            </motion.div>
          </motion.div>

          {/* Part A */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="mb-6 flex items-center gap-4 px-2">
              <div className="h-10 w-2 rounded-full bg-gray-900" />
              <h2 className="text-3xl font-bold text-gray-900">
                Part A: Pre-Clinical & Para-Clinical
              </h2>
              <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800">
                100 Marks
              </span>
            </div>

            <div className="divide-y divide-gray-100 overflow-hidden rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-sm">
              {[
                { label: "Anatomy", marks: 17, icon: Microscope },
                { label: "Physiology", marks: 17, icon: Activity },
                { label: "Biochemistry", marks: 17, icon: Stethoscope },
                { label: "Pathology", marks: 13, icon: Microscope },
                { label: "Microbiology", marks: 13, icon: Microscope },
                { label: "Pharmacology", marks: 13, icon: Pill },
                { label: "Forensic Medicine", marks: 10, icon: AlertCircle },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 font-medium text-gray-600">
                    <item.icon size={20} className="text-gray-400" />
                    <span className="text-lg text-gray-900">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {item.marks}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Part B */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="mb-6 flex items-center gap-4 px-2">
              <div className="h-10 w-2 rounded-full bg-gray-900" />
              <h2 className="text-3xl font-bold text-gray-900">
                Part B: Clinical Subjects
              </h2>
              <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800">
                200 Marks
              </span>
            </div>

            <div className="divide-y divide-gray-100 overflow-hidden rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-sm">
              <div className="p-6 transition-colors hover:bg-gray-50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-lg font-medium text-gray-900">
                    <Stethoscope size={20} className="text-gray-400" /> Medicine
                    and Allied Subjects
                  </div>
                  <div className="text-lg font-bold text-gray-900">48</div>
                </div>
                <div className="grid grid-cols-2 gap-3 pl-9 md:grid-cols-4">
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Medicine (33)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Psychiatry (5)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Dermatology (5)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Radiotherapy (5)
                  </span>
                </div>
              </div>

              <div className="p-6 transition-colors hover:bg-gray-50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-lg font-medium text-gray-900">
                    <Syringe size={20} className="text-gray-400" /> General
                    Surgery & Allied
                  </div>
                  <div className="text-lg font-bold text-gray-900">47</div>
                </div>
                <div className="grid grid-cols-2 gap-3 pl-9 md:grid-cols-4">
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    General Surgery (32)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Anesthesiology (5)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Orthopedics (5)
                  </span>
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    Radiodiagnosis (5)
                  </span>
                </div>
              </div>

              {[
                { label: "Pediatrics", marks: 15, icon: Baby },
                { label: "Ophthalmology", marks: 15, icon: Heart },
                { label: "Otorhinolaryngology (ENT)", marks: 15, icon: Brain },
                { label: "Obstetrics and Gynecology", marks: 30, icon: Users },
                { label: "Community Medicine (PSM)", marks: 30, icon: Users },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 font-medium">
                    <item.icon size={20} className="text-gray-400" />
                    <span className="text-lg text-gray-900">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {item.marks}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* High-Yield Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
              High-Yield Topics
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  title: "Anatomy",
                  topics:
                    "General anatomy, embryology, neuroanatomy, regional anatomy.",
                },
                {
                  title: "Physiology",
                  topics:
                    "General physiology, nerve-muscle physiology, CVS, respiratory system, CNS.",
                },
                {
                  title: "Biochemistry",
                  topics:
                    "Carbohydrate, lipid, protein metabolism; vitamins; enzymes.",
                },
                {
                  title: "Pathology",
                  topics: "General pathology, hematology, systemic pathology.",
                },
                {
                  title: "Microbiology",
                  topics: "Immunology, bacteriology, virology, parasitology.",
                },
                {
                  title: "Pharmacology",
                  topics:
                    "General pharmacology, autonomic nervous system, antibiotics.",
                },
                {
                  title: "Medicine",
                  topics:
                    "Infectious diseases, cardiology, neurology, nephrology.",
                },
                {
                  title: "Surgery",
                  topics:
                    "General surgery principles, gastrointestinal surgery, urology.",
                },
                {
                  title: "Obstetrics and Gynecology",
                  topics: "Antenatal care, labor complications, contraception.",
                },
                {
                  title: "Community Medicine",
                  topics:
                    "Epidemiology, biostatistics, national health programs, vaccines.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h4 className="mb-3 text-xl font-bold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="leading-relaxed font-medium text-gray-500">
                    {item.topics}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
