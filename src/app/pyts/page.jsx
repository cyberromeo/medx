"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, ChevronDown, History } from "lucide-react";
import { pytsData } from "@/lib/pyts";

export default function PYTsPage() {
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const toggleSubject = (subjectId) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
    }
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="mb-4 inline-flex items-center rounded-lg bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-700">
            Revision
          </span>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm mt-1">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Past Year Topics
              </h1>
              <p className="mt-2 max-w-[600px] text-sm font-medium text-gray-500 leading-relaxed">
                A comprehensive collection of highly-tested topics from previous years. Topics marked with 
                <span className="inline-flex items-center justify-center mx-1 text-sm bg-orange-50 rounded-md px-1.5 py-0.5">
                  🔸
                </span>
                have a history of frequent repetition.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Subjects Accordion */}
        <div className="flex flex-col gap-4">
          {pytsData.map((subject, index) => {
            const isExpanded = expandedSubject === subject.subjectId;
            
            return (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-sm transition-all md:rounded-[2rem]"
              >
                <button
                  onClick={() => toggleSubject(subject.subjectId)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 md:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors">
                      <Folder size={24} className={isExpanded ? "fill-orange-200" : ""} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                        {subject.subjectName}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        {subject.topics.length} Topics
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180 bg-orange-50 text-orange-600" : ""
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[rgba(30,50,90,0.05)]"
                    >
                      <div className="flex flex-col gap-3 p-5 md:p-6">
                        {subject.topics.map((topic, tIndex) => (
                          <div
                            key={tIndex}
                            className={`flex items-center justify-between rounded-2xl p-4 transition-colors ${
                              topic.priority > 0 
                                ? "bg-orange-50/50 border border-orange-100" 
                                : "bg-gray-50/50 border border-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-400 shadow-sm shrink-0">
                                {(tIndex + 1).toString().padStart(2, '0')}
                              </span>
                              <h4 className={`text-sm md:text-base ${topic.priority > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                {topic.title}
                                {topic.priority > 0 && (
                                  <span className="ml-2 text-sm tracking-[2px]">
                                    {"🔸".repeat(topic.priority)}
                                  </span>
                                )}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
