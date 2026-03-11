"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MCQ_SUBCATEGORIES, getTestsBySubcategory } from "@/lib/mcq";

export default function McqPage() {
  const [loading, setLoading] = useState(true);
  const [testCounts, setTestCounts] = useState({});
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await account.get();
      } catch {
        router.push("/login");
        return;
      }

      // Fetch test counts for each subcategory
      const counts = {};
      for (const sub of MCQ_SUBCATEGORIES) {
        const tests = await getTestsBySubcategory(sub.slug);
        counts[sub.slug] = tests.reduce((sum, t) => sum + (t.questionCount || 0), 0);
      }
      setTestCounts(counts);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-4 pt-24 max-w-lg">
        {/* Back + Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted text-sm mb-4 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display">
                MCQs
              </h1>
              <p className="text-muted text-sm">Select a question set</p>
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
                  className="block panel rounded-3xl p-6 relative overflow-hidden transition-all active:scale-[0.98] hover:border-primary/30"
                >
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl bg-primary/10" />
                  <div className="flex items-center gap-4 mb-3 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-2xl shrink-0">
                      {sub.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{sub.title}</h2>
                      <p className="text-xs text-muted">{sub.description}</p>
                    </div>
                    <ArrowRight size={20} className="text-muted shrink-0" />
                  </div>
                  <div className="relative z-10 mt-2">
                    <p className="text-sm text-muted">
                      {qCount > 0 ? `${qCount} questions available` : "Tests available — tap to view"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
