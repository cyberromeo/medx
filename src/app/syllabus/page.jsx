"use client";

import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle2, FileText, Activity, Microscope, Stethoscope, Baby, Brain, Heart, Syringe, Pill, Users } from "lucide-react";

export default function SyllabusPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="halo-bg" />
      <div className="grid-bg" />
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              FMGE <span className="text-gradient">Syllabus</span>
            </h1>
            <p className="text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Based on the Graduate Medical Education Regulations issued by the National Medical Commission.
              The exam assesses knowledge from the entire MBBS curriculum.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="stat-card">
              <div className="bg-primary-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <FileText className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">300 MCQs</h3>
              <p className="text-muted text-sm">Divided into two parts. Each part contains 150 questions.</p>
            </div>
            <div className="stat-card">
              <div className="bg-secondary-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">150 Minutes</h3>
              <p className="text-muted text-sm">Time allocated for each part. Total duration is 300 minutes.</p>
            </div>
            <div className="stat-card">
              <div className="bg-accent-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pass: 150/300</h3>
              <p className="text-muted text-sm">No negative marking. Score 150 or above to qualify.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 grad-primary rounded-full" />
              <h2 className="text-2xl font-bold">Part A: Pre-Clinical and Para-Clinical Subjects</h2>
              <span className="chip">100 Marks</span>
            </div>

            <div className="panel rounded-2xl divide-y divide-white/10">
              {[
                { label: "Anatomy", marks: 17, icon: Microscope },
                { label: "Physiology", marks: 17, icon: Activity },
                { label: "Biochemistry", marks: 17, icon: Stethoscope },
                { label: "Pathology", marks: 13, icon: Microscope },
                { label: "Microbiology", marks: 13, icon: Microscope },
                { label: "Pharmacology", marks: 13, icon: Pill },
                { label: "Forensic Medicine", marks: 10, icon: AlertCircle },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-muted">
                    <item.icon size={16} />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.marks}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 grad-primary rounded-full" />
              <h2 className="text-2xl font-bold">Part B: Clinical Subjects</h2>
              <span className="chip">200 Marks</span>
            </div>

            <div className="panel rounded-2xl divide-y divide-white/10">
              <div className="p-4">
                <div className="flex items-center gap-2 text-white font-medium mb-2">
                  <Stethoscope size={16} /> Medicine and Allied Subjects
                </div>
                <div className="text-xs text-muted grid grid-cols-2 gap-2 pl-6">
                  <span>Medicine (33)</span>
                  <span>Psychiatry (5)</span>
                  <span>Dermatology and STD (5)</span>
                  <span>Radiotherapy (5)</span>
                </div>
                <div className="text-right text-white font-semibold mt-2">48</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-white font-medium mb-2">
                  <Syringe size={16} /> General Surgery and Allied Subjects
                </div>
                <div className="text-xs text-muted grid grid-cols-2 gap-2 pl-6">
                  <span>General Surgery (32)</span>
                  <span>Anesthesiology (5)</span>
                  <span>Orthopedics (5)</span>
                  <span>Radiodiagnosis (5)</span>
                </div>
                <div className="text-right text-white font-semibold mt-2">47</div>
              </div>
              {[
                { label: "Pediatrics", marks: 15, icon: Baby },
                { label: "Ophthalmology", marks: 15, icon: Heart },
                { label: "Otorhinolaryngology (ENT)", marks: 15, icon: Brain },
                { label: "Obstetrics and Gynecology", marks: 30, icon: Users },
                { label: "Community Medicine (PSM)", marks: 30, icon: Users },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-muted">
                    <item.icon size={16} />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.marks}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-10">High-Yield Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Anatomy", topics: "General anatomy, embryology, neuroanatomy, regional anatomy (upper/lower limbs, head and neck)." },
                { title: "Physiology", topics: "General physiology, nerve-muscle physiology, CVS, respiratory system, CNS." },
                { title: "Biochemistry", topics: "Carbohydrate, lipid, protein metabolism; vitamins; enzymes; molecular biology." },
                { title: "Pathology", topics: "General pathology (inflammation, neoplasia), hematology, systemic pathology (liver, kidney, CVS)." },
                { title: "Microbiology", topics: "Immunology, bacteriology, virology, parasitology." },
                { title: "Pharmacology", topics: "General pharmacology, autonomic nervous system, antibiotics, cardiovascular drugs." },
                { title: "Medicine", topics: "Infectious diseases, cardiology, neurology, nephrology, endocrinology." },
                { title: "Surgery", topics: "General surgery principles (wounds, shock, burns), gastrointestinal surgery, urology." },
                { title: "Obstetrics and Gynecology", topics: "Antenatal care, labor complications, contraception, menstrual disorders." },
                { title: "Community Medicine", topics: "Epidemiology, biostatistics, national health programs, vaccines." },
              ].map((item, i) => (
                <div key={i} className="panel rounded-xl p-5 border border-white/10">
                  <h4 className="font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{item.topics}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-muted text-sm">
        <p>(c) 2026 MedX - FMGE Preparation Platform</p>
      </footer>
    </main>
  );
}
