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
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f0f0f0]">
        <AlertCircle size={48} className="text-[#898989] mb-4" />
        <h1 className="mb-2 text-xl font-bold text-[#303030]">Not Found</h1>
        <Link href="/mcq" className="text-blue-600 font-medium text-sm">
          ← Back to MCQs
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0f0f0] pb-20">
      <div className="container mx-auto max-w-lg px-4 pt-16">
        <Link
          href="/mcq"
          className="text-[#898989] mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-[#303030]"
        >
          <ChevronLeft size={16} />
          Back to MCQs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-4">
            <div className="bg-blue-600 shadow-sm flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white">
              {subcategory.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#303030]">
                {subcategory.title}
              </h1>
              <p className="text-[#898989] font-medium text-sm">{subcategory.description}</p>
            </div>
          </div>
        </motion.div>

        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#898989]/10">
              <BookOpen size={36} className="text-[#898989]" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#303030]">No Tests Yet</h2>
            <p className="text-[#898989] font-medium mx-auto max-w-xs text-sm">
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
                  className="group bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:bg-white hover:border-blue-300 relative block overflow-hidden rounded-[1.5rem] p-5 transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="bg-blue-100/50 absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 group-hover:bg-blue-200/50" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-600 border border-blue-100 shadow-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl">
                      {test.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base leading-tight font-bold text-[#303030]">
                        {test.title}
                      </h2>
                      <p className="text-[#898989] font-medium mt-1 text-xs">
                        {test.questionCount} questions
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-[#898989] shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
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
