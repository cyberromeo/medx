"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ClipboardList, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MCQ_SUBCATEGORIES, getTestsBySubcategory } from "@/lib/mcq";

export default function McqPage() {
  const [loading, setLoading] = useState(true);
  const [testCounts, setTestCounts] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch test counts for each subcategory
      const counts = {};
      for (const sub of MCQ_SUBCATEGORIES) {
        const tests = await getTestsBySubcategory(sub.slug);
        counts[sub.slug] = tests.reduce(
          (sum, t) => sum + (t.questionCount || 0),
          0,
        );
      }
      setTestCounts(counts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-6 sm:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="container mx-auto max-w-lg">
        {/* Back + Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="text-[#898989] mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-[#303030]"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="mb-2 flex items-center gap-4">
            <div className="bg-blue-600 shadow-sm flex h-12 w-12 items-center justify-center rounded-2xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl text-[#303030] tracking-tight">
                MCQs
              </h1>
              <p className="text-[#898989] font-medium text-sm">Select a question set</p>
            </div>
          </div>
        </motion.div>

        {/* Subcategory Cards */}
        <div className="space-y-4">
          {MCQ_SUBCATEGORIES.map((sub, index) => {
            const qCount = testCounts[sub.slug] || 0;

            return (
               <motion.div
                key={sub.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/mcq/${sub.slug}`}
                  className="group bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:bg-white hover:border-blue-300 relative block overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="bg-blue-100/50 absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl transition-colors duration-500 group-hover:bg-blue-200/50" />
                  <div className="relative z-10 mb-3 flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-600 border border-blue-100 shadow-sm flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl">
                      {sub.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#303030] sm:text-xl">
                        {sub.title}
                      </h2>
                      <p className="text-[#898989] font-medium text-sm">
                        {qCount} Questions
                      </p>
                    </div>
                  </div>
                  <div className="text-[#5E6470] relative z-10 text-sm">
                    {sub.description}
                  </div>
                  <div className="text-blue-600 relative z-10 mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors group-hover:text-blue-700">
                    View Tests <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
