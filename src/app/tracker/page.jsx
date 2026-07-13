"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Target, Award, PlaySquare, BookOpen, FileText, Check } from "lucide-react";
import Link from "next/link";
import { getTrackerData, updateSubjectTracker, updateGTTracker, SUBJECTS_LIST } from "@/lib/tracker";

const TOTAL_ITEMS = (19 * 6) + 7; // 19 subjects * 6 tasks + 7 GTs

export default function TrackerPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const trackerData = await getTrackerData(currentUser.uid);
        setData(trackerData);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubjectChange = async (subject, field, currentValue) => {
    // Optimistic update
    setData((prev) => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: {
          ...prev.subjects[subject],
          [field]: !currentValue
        }
      }
    }));
    await updateSubjectTracker(user.uid, subject, field, !currentValue);
  };

  const handleGTChange = async (gt, currentValue) => {
    // Optimistic update
    setData((prev) => ({
      ...prev,
      gts: {
        ...prev.gts,
        [gt]: !currentValue
      }
    }));
    await updateGTTracker(user.uid, gt, !currentValue);
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Calculate Progress
  let completedCount = 0;
  SUBJECTS_LIST.forEach(sub => {
    if (data.subjects[sub]?.Videos) completedCount++;
    if (data.subjects[sub]?.R1) completedCount++;
    if (data.subjects[sub]?.R2) completedCount++;
    if (data.subjects[sub]?.PYQs) completedCount++;
    if (data.subjects[sub]?.RevisionVideos) completedCount++;
    if (data.subjects[sub]?.Qbank) completedCount++;
  });
  
  Object.keys(data.gts).forEach(gt => {
    if (data.gts[gt]) completedCount++;
  });

  const progressPercentage = Math.round((completedCount / TOTAL_ITEMS) * 100) || 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 sm:p-10 pb-32">
      <div className="container mx-auto max-w-6xl">
        
        {/* Sticky Top Bar for Progress */}
        <div className="sticky top-4 z-50 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-[#898989]/20 shadow-lg rounded-3xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#303030] tracking-tight flex items-center gap-2">
                  <Target className="text-blue-600" />
                  FMGE Syllabus Tracker
                </h1>
                <p className="text-[#898989] text-sm font-medium mt-1">
                  Track your revisions, PYQs, Qbanks, and GTs.
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold text-blue-600">{progressPercentage}%</span>
                <span className="text-sm font-bold text-[#898989] ml-2 uppercase tracking-wider">Completed</span>
                <p className="text-xs font-semibold text-[#898989]">{completedCount} of {TOTAL_ITEMS} items done</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#898989]/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Grand Tests Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-amber-500" />
            <h2 className="text-xl font-bold text-[#303030]">Grand Tests (GTs)</h2>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map(num => {
                const gtKey = `GT${num}`;
                const isChecked = data.gts[gtKey];
                return (
                  <button
                    key={gtKey}
                    onClick={() => handleGTChange(gtKey, isChecked)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all border ${
                      isChecked 
                        ? "bg-amber-50 border-amber-200 shadow-sm" 
                        : "bg-white border-[#898989]/10 hover:border-[#898989]/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isChecked ? "bg-amber-500 text-white" : "bg-[#898989]/10 text-[#898989]"
                    }`}>
                      {isChecked ? <Check size={20} strokeWidth={3} /> : <span className="font-bold">{num}</span>}
                    </div>
                    <span className={`font-bold text-sm ${isChecked ? "text-amber-700" : "text-[#898989]"}`}>
                      GT {num}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-blue-600" />
          <h2 className="text-xl font-bold text-[#303030]">19 Subjects</h2>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {SUBJECTS_LIST.map((subject) => {
            const subData = data.subjects[subject] || {};
            const items = [
              { key: "Videos", label: "Videos", icon: PlaySquare },
              { key: "R1", label: "Revision 1", icon: BookOpen },
              { key: "R2", label: "Revision 2", icon: CheckCircle2 },
              { key: "PYQs", label: "PYQs", icon: FileText },
              { key: "RevisionVideos", label: "Revision Videos", icon: PlaySquare },
              { key: "Qbank", label: "Qbank", icon: Target },
            ];

            // Count subject progress
            const subCompleted = items.filter(i => subData[i.key]).length;
            const subProgress = Math.round((subCompleted / 6) * 100);

            return (
              <motion.div 
                key={subject} 
                variants={item}
                className="bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Progress bg fill indicator (very subtle) */}
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" 
                  style={{ width: `${subProgress}%` }}
                />

                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg font-bold text-[#303030] leading-tight pr-4">
                    {subject}
                  </h3>
                  <div className="bg-[#898989]/10 text-[#303030] px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                    {subCompleted}/6
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const isChecked = subData[item.key];
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSubjectChange(subject, item.key, isChecked)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                          isChecked 
                            ? "bg-blue-50/50 border-blue-200" 
                            : "bg-white border-[#898989]/10 hover:border-[#898989]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isChecked ? "text-blue-500" : "text-[#898989]"} />
                          <span className={`text-sm font-semibold ${isChecked ? "text-blue-900" : "text-[#5E6470]"}`}>
                            {item.label}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isChecked ? "bg-blue-500 text-white" : "bg-[#898989]/20"
                        }`}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}
