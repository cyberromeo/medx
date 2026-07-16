"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X, Play } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SeriesCard from "@/components/SeriesCard";
import { getProgress } from "@/lib/progress";

export default function SeriesPage() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({ watched: [] });
  const router = useRouter();

  const MIST_SUBJECTS = [
    "Anatomy", "Physiology", "Biochemistry", "Pathology",
    "Microbiology", "Pharmacology", "Forensic medicine",
    "Community Medicine (PSM)", "General Medicine", "General Surgery",
    "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
    "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
    "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
  ];

  const MIST_2026_SUBJECTS = [
    "ANATOMY", "PATHOLOGY", "PHYSIOLOGY", "ANESTHESIA", "OPHTHALMOLOGY", 
    "FORENSIC MEDICINE", "ENT", "PSYCHIATRY", "MEDICINE - DR. KUNAL", 
    "OB GYNE", "PAEDIATRICS", "RADIOLOGY", "BIOCHEMISTRY", "ORTHOPAEDIC", 
    "DERMATOLOGY", "PHARMACOLOGY", "MICROBIOLOGY", "MEDICINE BY DR.SINGARAM", 
    "PSM", "SURGERY"
  ];

  const MIST_2026_REVISION_SUBJECTS = [
    "ANATOMY REVISION",
    "ENT REVISION",
    "OPHTHALMOLOGY REVISION",
    "RADIOLOGY REVISION"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchVideos();
        const userProgress = await getProgress(currentUser.uid);
        setProgress(userProgress);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc"),
        limit(1000)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ $id: doc.id, ...doc.data() }));
      setVideos(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const countVideos = (category) => videos.filter(v => v.category === category).length;
  const countWatched = (category) => videos.filter(v => v.category === category && progress.watched.includes(v.$id)).length;
  const getCategoryProgress = (category) => {
    const total = countVideos(category);
    const watched = countWatched(category);
    return total > 0 ? Math.round((watched / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 md:mb-8 md:gap-4"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm md:h-12 md:w-12">
            <Play size={20} className="ml-0.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Video Library
            </h1>
            <p className="text-xs font-medium text-gray-500 md:text-sm">Select a video category</p>
          </div>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* MIST 2026 card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedCategory("MIST_2026")}
            className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8"
          >
            <div className="mb-6 flex items-start justify-between md:mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xl font-bold text-white shadow-sm">
                  M
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-emerald-600 md:text-3xl">
                    MIST JUNE 2026
                  </h2>
                  <span className="mt-1 inline-block rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">NEW</span>
                  <p className="mt-0.5 text-sm font-medium text-gray-500">
                    {countWatched("MIST_2026")}/{countVideos("MIST_2026")} videos &middot; {MIST_2026_SUBJECTS.length} subjects
                  </p>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-emerald-600">
                <ArrowRight size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Course Progress</span>
                <span className="text-sm font-bold text-emerald-600">{getCategoryProgress("MIST_2026")}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryProgress("MIST_2026")}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-600"
                />
              </div>
            </div>
          </motion.div>
          {/* MIST 2026 REVISION card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            onClick={() => setSelectedCategory("MIST_2026_REVISION")}
            className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8"
          >
            <div className="mb-6 flex items-start justify-between md:mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-xl font-bold text-white shadow-sm">
                  R
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-purple-600 md:text-3xl">
                    MIST 2026 REVISION
                  </h2>
                  <span className="mt-1 inline-block rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-600 uppercase tracking-wider">REVISION</span>
                  <p className="mt-0.5 text-sm font-medium text-gray-500">
                    {countWatched("MIST_2026_REVISION")}/{countVideos("MIST_2026_REVISION")} videos &middot; {MIST_2026_REVISION_SUBJECTS.length} subjects
                  </p>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-purple-600">
                <ArrowRight size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Course Progress</span>
                <span className="text-sm font-bold text-purple-600">{getCategoryProgress("MIST_2026_REVISION")}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryProgress("MIST_2026_REVISION")}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-purple-600"
                />
              </div>
            </div>
          </motion.div>
          {/* MIST card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            onClick={() => setSelectedCategory("MIST")}
            className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8"
          >
            <div className="mb-6 flex items-start justify-between md:mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white shadow-sm">
                  M
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-blue-600 md:text-3xl">
                    MIST JUNE 2025
                  </h2>
                  <span className="mt-1 inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">Archived</span>
                  <p className="mt-0.5 text-sm font-medium text-gray-500">
                    {countWatched("MIST")}/{countVideos("MIST")} videos &middot; 19 subjects
                  </p>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-blue-600">
                <ArrowRight size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Course Progress</span>
                <span className="text-sm font-bold text-blue-600">{getCategoryProgress("MIST")}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryProgress("MIST")}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-blue-600"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Subject modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCategory(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[2rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-2xl sm:h-[85vh] sm:rounded-[2rem]"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(30,50,90,0.06)] bg-white/90 p-4 backdrop-blur-md sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-lg font-bold text-blue-600">
                    {selectedCategory.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCategory}</h2>
                    <p className="mt-0.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">Select Subject</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all active:scale-95 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Subject grid */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-2 xl:grid-cols-3">
                  {selectedCategory === "MIST_2026" && MIST_2026_SUBJECTS.map((subCategory) => {
                    const subVideos = videos.filter(v =>
                      v.category === selectedCategory &&
                      v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                    );
                    return (
                      <motion.div key={subCategory} variants={item}>
                        <SeriesCard
                          title={subCategory}
                          category={selectedCategory}
                          videos={subVideos}
                          itemVariants={item}
                          watchedIds={progress.watched}
                        />
                      </motion.div>
                    );
                  })}
                  {selectedCategory === "MIST_2026_REVISION" && MIST_2026_REVISION_SUBJECTS.map((subCategory) => {
                    const subVideos = videos.filter(v =>
                      v.category === selectedCategory &&
                      v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                    );
                    return (
                      <motion.div key={subCategory} variants={item}>
                        <SeriesCard
                          title={subCategory}
                          category={selectedCategory}
                          videos={subVideos}
                          itemVariants={item}
                          watchedIds={progress.watched}
                        />
                      </motion.div>
                    );
                  })}
                  {selectedCategory === "MIST" && MIST_SUBJECTS.map((subCategory) => {
                    const subVideos = videos.filter(v =>
                      v.category === selectedCategory &&
                      v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                    );
                    return (
                      <motion.div key={subCategory} variants={item}>
                        <SeriesCard
                          title={subCategory}
                          category={selectedCategory}
                          videos={subVideos}
                          itemVariants={item}
                          watchedIds={progress.watched}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}