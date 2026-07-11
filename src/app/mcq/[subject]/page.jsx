"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ArrowRight,
  BookOpen,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { getSubcategoryBySlug, getTestsBySubcategory } from "@/lib/mcq";

export default function SubcategoryTestsPage() {
  const router = useRouter();
  const { subject: slug } = useParams();
  const [authLoading, setAuthLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const subcategory = getSubcategoryBySlug(slug);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authLoading || !subcategory) return;
    (async () => {
      const t = await getTestsBySubcategory(slug);
      setTests(t);
      setLoading(false);
    })();
  }, [authLoading, slug, subcategory]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <AlertCircle size={48} className="text-muted mb-4" />
        <h1 className="text-xl font-bold mb-2">Not Found</h1>
        <Link href="/mcq" className="text-primary text-sm">
          ← Back to MCQs
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-4 pt-16 max-w-lg">
        <Link
          href="/mcq"
          className="inline-flex items-center gap-2 text-muted text-sm mb-6 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Back to MCQs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-2xl shrink-0">
              {subcategory.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">
                {subcategory.title}
              </h1>
              <p className="text-muted text-sm">{subcategory.description}</p>
            </div>
          </div>
        </motion.div>

        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <BookOpen size={36} className="text-muted" />
            </div>
            <h2 className="text-lg font-bold mb-2">No Tests Yet</h2>
            <p className="text-muted text-sm max-w-xs mx-auto">
              Tests for this category are coming soon. Check back later!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={`/mcq/${slug}/${test.slug}`}
                  className="block panel rounded-3xl p-5 relative overflow-hidden transition-all active:scale-[0.98] hover:border-primary/30"
                >
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl bg-primary/8" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl shrink-0">
                      {test.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-white leading-tight">
                        {test.title}
                      </h2>
                      <p className="text-xs text-muted mt-1">
                        {test.questionCount} questions
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-muted shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
