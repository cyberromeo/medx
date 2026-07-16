"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Target, ScrollText, FileQuestion } from "lucide-react";
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
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              QBank
            </h1>
            <p className="text-sm font-medium text-gray-500">Select a question set</p>
          </div>
        </motion.div>

        {/* Subcategory cards */}
        <div className="space-y-4">
          {MCQ_SUBCATEGORIES.map((sub, index) => {
            const qCount = testCounts[sub.slug] || 0;
            const IconComponent = sub.icon === "Target" ? Target : sub.icon === "ScrollText" ? ScrollText : FileQuestion;

            return (
              <motion.div
                key={sub.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={`/mcq/${sub.slug}`}
                  className="group relative block overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-6"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                      <IconComponent size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                        {sub.title}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        {qCount} Questions
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{sub.description}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-400 transition-all duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
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