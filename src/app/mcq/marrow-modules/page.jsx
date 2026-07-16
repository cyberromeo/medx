"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, X, ArrowLeft, CheckCircle2, Circle, ExternalLink, Activity } from "lucide-react";
import Link from "next/link";
import marrowData from "@/lib/marrow-modules.json";
import { getProgress, markVideoWatched, isVideoWatched } from "@/lib/progress";

export default function MarrowModulesPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({ watched: [] });
  
  const [currentMode, setCurrentMode] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      const userProgress = await getProgress(currentUser.uid);
      setProgress(userProgress);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleMarkDone = async (e, moduleId) => {
    e.preventDefault();
    if (markingDone || isVideoWatched(progress.watched, moduleId)) return;
    
    setMarkingDone(true);
    const result = await markVideoWatched(moduleId, user.uid);
    if (result.progress) {
      setProgress(result.progress);
    }
    setMarkingDone(false);
  };

  const modes = Object.keys(marrowData);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10">
      <div className="mx-auto max-w-4xl">
        
        {/* Top level Back to Library link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/mcq" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} />
            Back to Library
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {currentMode ? (currentMode === '100 question tests' ? '100 Question Tests' : 'Topic Wise Tests') : "Marrow Modules"}
              </h1>
              <p className="text-sm font-medium text-gray-500">
                {currentMode ? "Select a subject to view tests" : "Specially compiled modules for active revision"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Folder Grid */}
        <AnimatePresence mode="wait">
          {!currentMode ? (
            /* Level 1: Modes */
            <motion.div
              key="modes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {modes.map((mode, index) => {
                const totalTests = Object.values(marrowData[mode]).reduce((acc, curr) => acc + curr.length, 0);
                const title = mode === '100 question tests' ? '100 Question Tests' : 'Topic Wise Tests';
                
                return (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setCurrentMode(mode)}
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600">
                      <Folder size={40} fill="currentColor" className="opacity-20" />
                      <Folder size={40} className="absolute" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {title}
                    </h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {totalTests} Tests
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* Level 2: Subjects */
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => setCurrentMode(null)}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700"
              >
                <ArrowLeft size={16} />
                Back to Modules
              </button>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Object.keys(marrowData[currentMode]).map((subject, index) => {
                  const tests = marrowData[currentMode][subject];
                  
                  return (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedSubject(subject)}
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600">
                        <Folder size={32} fill="currentColor" className="opacity-20" />
                        <Folder size={32} className="absolute" />
                      </div>
                      <h2 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {subject}
                      </h2>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subject Tests Modal */}
      <AnimatePresence>
        {selectedSubject && currentMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubject(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-2xl sm:h-[85vh] sm:rounded-[2rem]"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(30,50,90,0.06)] bg-white/90 p-4 backdrop-blur-md sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedSubject}</h2>
                    <p className="mt-0.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      {marrowData[currentMode][selectedSubject].length} Tests
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all active:scale-95 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tests Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {marrowData[currentMode][selectedSubject].map((test, idx) => {
                    const moduleId = `marrow_${currentMode.replace(/\s+/g, '_')}_${selectedSubject}_${idx}`;
                    const isDone = isVideoWatched(progress.watched, moduleId);
                    
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col rounded-2xl border transition-colors ${isDone ? 'border-orange-200 bg-orange-50/30' : 'border-[rgba(30,50,90,0.05)] bg-gray-50/50 hover:bg-gray-50'}`}
                      >
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm border ${isDone ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-orange-600 border-[rgba(30,50,90,0.05)]'}`}>
                              <Activity size={20} />
                            </div>
                            <div>
                              <h3 className={`line-clamp-2 text-sm font-bold leading-tight ${isDone ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                                {test.title}
                              </h3>
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="inline-flex rounded-md bg-white border border-[rgba(30,50,90,0.05)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                  {currentMode === '100 question tests' ? '100 MCQs' : 'Topic Wise'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Checklist button */}
                          <button
                            onClick={(e) => handleMarkDone(e, moduleId)}
                            disabled={isDone || markingDone}
                            className={`shrink-0 rounded-full p-1 transition-all ${isDone ? 'text-green-500' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}
                            title={isDone ? "Completed" : "Mark as done"}
                          >
                            {isDone ? <CheckCircle2 size={24} className="fill-green-100" /> : <Circle size={24} />}
                          </button>
                        </div>
                        
                        <div className="mt-auto border-t border-[rgba(30,50,90,0.05)] flex">
                          <a
                            href={test.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700 hover:bg-orange-50/50 rounded-b-2xl active:scale-[0.98]"
                          >
                            <ExternalLink size={16} />
                            Give Test
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
