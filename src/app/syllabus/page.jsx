"use client";

import Header from "@/components/Header";
import { motion } from "framer-motion";
import { BookOpen, Clock, AlertCircle, CheckCircle2, FileText, Activity, Microscope, Stethoscope, Baby, Brain, Heart, Syringe, Pill, Users } from "lucide-react";

export default function SyllabusPage() {
    return (
        <main className="min-h-screen relative overflow-hidden selection:bg-primary/30 bg-background text-white">
            <div className="mesh-bg" />
            <div className="aurora-bg" />
            <Header />

            <section className="pt-32 pb-20 px-4 sm:px-6 relative z-10">
                <div className="container mx-auto max-w-5xl">

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                            FMGE <span className="text-gradient-animated">Syllabus</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Based on the Graduate Medical Education Regulations issued by the National Medical Commission.
                            The exam assesses knowledge from the entire MBBS curriculum.
                        </p>
                    </motion.div>

                    {/* Exam Structure */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                    >
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <FileText className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">300 MCQs</h3>
                            <p className="text-gray-400 text-sm">Divided into two parts (Part A & Part B). Each part contains 150 questions.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Clock className="text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">150 Minutes</h3>
                            <p className="text-gray-400 text-sm">Time allocated for each part. Total duration is 300 minutes for the full exam.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircle2 className="text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Pass: 150/300</h3>
                            <p className="text-gray-400 text-sm">No negative marking. You need a score of 150 or above to qualify.</p>
                        </div>
                    </motion.div>

                    {/* Part A Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full" />
                            <h2 className="text-2xl font-bold">Part A: Pre-Clinical & Para-Clinical Subjects</h2>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-gray-300 border border-white/10">100 Marks</span>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 font-semibold text-gray-300">Subject</th>
                                        <th className="p-4 font-semibold text-white text-right">Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-gray-400">
                                    <tr><td className="p-4 flex items-center gap-2"><Microscope size={16} /> Anatomy</td><td className="p-4 text-right font-medium text-white">17</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Activity size={16} /> Physiology</td><td className="p-4 text-right font-medium text-white">17</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Stethoscope size={16} /> Biochemistry</td><td className="p-4 text-right font-medium text-white">17</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Microscope size={16} /> Pathology</td><td className="p-4 text-right font-medium text-white">13</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Microscope size={16} /> Microbiology</td><td className="p-4 text-right font-medium text-white">13</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Pill size={16} /> Pharmacology</td><td className="p-4 text-right font-medium text-white">13</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><AlertCircle size={16} /> Forensic Medicine</td><td className="p-4 text-right font-medium text-white">10</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Part B Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-gradient-to-b from-secondary to-accent rounded-full" />
                            <h2 className="text-2xl font-bold">Part B: Clinical Subjects</h2>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-gray-300 border border-white/10">200 Marks</span>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 font-semibold text-gray-300">Subject</th>
                                        <th className="p-4 font-semibold text-white text-right">Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-gray-400">
                                    <tr>
                                        <td className="p-4">
                                            <div className="font-medium text-white mb-1 flex items-center gap-2"><Stethoscope size={16} /> Medicine & Allied Subjects</div>
                                            <div className="text-xs pl-6 grid grid-cols-2 gap-2 mt-2 opacity-80">
                                                <span>• Medicine (33)</span>
                                                <span>• Psychiatry (5)</span>
                                                <span>• Dermatology & STD (5)</span>
                                                <span>• Radiotherapy (5)</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-medium text-white align-top">48</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">
                                            <div className="font-medium text-white mb-1 flex items-center gap-2"><Syringe size={16} /> General Surgery & Allied Subjects</div>
                                            <div className="text-xs pl-6 grid grid-cols-2 gap-2 mt-2 opacity-80">
                                                <span>• General Surgery (32)</span>
                                                <span>• Anesthesiology (5)</span>
                                                <span>• Orthopedics (5)</span>
                                                <span>• Radiodiagnosis (5)</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-medium text-white align-top">47</td>
                                    </tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Baby size={16} /> Pediatrics</td><td className="p-4 text-right font-medium text-white">15</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Heart size={16} /> Ophthalmology</td><td className="p-4 text-right font-medium text-white">15</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Brain size={16} /> Otorhinolaryngology (ENT)</td><td className="p-4 text-right font-medium text-white">15</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Users size={16} /> Obstetrics & Gynecology</td><td className="p-4 text-right font-medium text-white">30</td></tr>
                                    <tr><td className="p-4 flex items-center gap-2"><Users size={16} /> Community Medicine (PSM)</td><td className="p-4 text-right font-medium text-white">30</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* High Yield Topics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-10">High-Yield Topics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Anatomy", topics: "General anatomy, embryology, neuroanatomy, regional anatomy (upper/lower limbs, head & neck)." },
                                { title: "Physiology", topics: "General physiology, nerve-muscle physiology, CVS, respiratory system, CNS." },
                                { title: "Biochemistry", topics: "Carbohydrate, lipid, protein metabolism; vitamins; enzymes; molecular biology." },
                                { title: "Pathology", topics: "General pathology (inflammation, neoplasia), hematology, systemic pathology (liver, kidney, CVS)." },
                                { title: "Microbiology", topics: "Immunology, bacteriology, virology, parasitology." },
                                { title: "Pharmacology", topics: "General pharmacology, autonomic nervous system, antibiotics, cardiovascular drugs." },
                                { title: "Medicine", topics: "Infectious diseases, cardiology, neurology, nephrology, endocrinology." },
                                { title: "Surgery", topics: "General surgery principles (wounds, shock, burns), gastrointestinal surgery, urology." },
                                { title: "Obstetrics & Gynecology", topics: "Antenatal care, labor complications, contraception, menstrual disorders." },
                                { title: "Community Medicine", topics: "Epidemiology, biostatistics, national health programs, vaccines." },
                            ].map((item, i) => (
                                <div key={i} className="glass-panel p-5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                                    <h4 className="font-bold text-white mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.topics}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
                <p>© 2026 MedX - FMGE Preparation Platform</p>
            </footer>
        </main>
    );
}
