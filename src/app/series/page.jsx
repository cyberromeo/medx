"use client";

import { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, X, Play } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <div className="flex h-[50vh] items-center justify-center p-6 sm:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const tones = {
    MIST: { accent: "#2dd4bf", soft: "rgba(45, 212, 191, 0.15)" },
    PYQs: { accent: "#f0f9ff", soft: "rgba(240, 249, 255, 0.5)" },
    MCQs: { accent: "#60a5fa", soft: "rgba(96, 165, 250, 0.15)" },
  };

  const renderCategoryCard = (name, delay = 0, isComingSoon = false) => {
    const categoryProgress = getCategoryProgress(name);
    const watched = countWatched(name);
    const total = countVideos(name);
    const tone = tones[name] || tones.MIST;

    return (
      <motion.div
        key={name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${isComingSoon ? "opacity-70" : "hover:shadow-xl hover:scale-[1.02] hover:bg-white hover:border-blue-300 cursor-pointer group"}`}
        onClick={() => !isComingSoon && setSelectedCategory(name)}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: tone.soft }} />

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${tone.accent}, #3b82f6)` }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#303030]">{name}</h2>
              {isComingSoon && (
                <span className="bg-[#898989]/10 text-[#898989] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Soon</span>
              )}
            </div>
            <p className="text-sm text-[#898989] font-medium">
              {isComingSoon ? "Archive coming soon" : `${watched}/${total} videos - 19 subjects`}
            </p>
          </div>
        </div>

        {!isComingSoon && (
          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-[#898989] uppercase tracking-wider">Course Progress</span>
              <span className="text-xs font-bold text-[#303030]">{categoryProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#898989]/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${categoryProgress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        )}

        {isComingSoon && (
          <div className="mb-6 h-10 flex items-center">
            <p className="text-xs text-[#898989] italic font-medium">Previous year questions vault unlocking soon...</p>
          </div>
        )}

        <button
          disabled={isComingSoon}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${isComingSoon ? "bg-[#898989]/10 text-[#898989] cursor-not-allowed" : "bg-[#303030] text-white group-hover:bg-blue-600 group-hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] shadow-md"}`}
        >
          <span>{isComingSoon ? "Notify Me" : `Open ${name}`}</span>
          {!isComingSoon && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </motion.div>
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 shadow-sm flex h-12 w-12 items-center justify-center rounded-2xl">
              <Play size={24} className="text-white ml-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl text-[#303030] tracking-tight">
                Video Library
              </h1>
              <p className="text-[#898989] font-medium text-sm">Select a video category</p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-sm">
          {renderCategoryCard("MIST", 0.1)}
        </div>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#898989]/20 p-0 sm:p-6 backdrop-blur-xl"
          >
            <div className="w-full max-w-6xl h-[90vh] sm:h-[85vh] bg-[#f9f9f9]/90 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl flex flex-col border border-white overflow-hidden relative">
              <div className="p-4 sm:p-6 flex items-center justify-between border-b border-[#898989]/10 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1rem] bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100 shadow-sm text-lg">
                    {selectedCategory.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#303030]">{selectedCategory}</h2>
                    <p className="text-xs font-bold text-[#898989] uppercase tracking-wider mt-0.5">Select Subject</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-3 rounded-xl hover:bg-white transition-all text-[#898989] hover:text-[#303030] active:scale-95 bg-white/60 border border-[#898989]/20 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto p-4 sm:p-6 bg-transparent"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-10">
                  {selectedCategory === "MIST" && MIST_SUBJECTS.map((subCategory) => {
                    const subVideos = videos.filter(v =>
                      v.category === selectedCategory &&
                      v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                    );
                    return (
                      <motion.div key={subCategory} variants={item}>
                        <SeriesCard
                          title={subCategory}
                          videos={subVideos}
                          itemVariants={item}
                          watchedIds={progress.watched}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
