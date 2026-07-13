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
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f0f0] p-6">
        <AlertCircle size={48} className="mb-4 text-gray-300" />
        <h1 className="mb-2 text-xl font-bold text-gray-900">Not Found</h1>
        <Link href="/mcq" className="text-sm font-medium text-blue-600">
          ← Back to MCQs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 md:p-10 md:pb-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/mcq"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Back to MCQs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-2xl text-blue-600">
            {subcategory.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subcategory.title}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              {subcategory.description}
            </p>
          </div>
        </motion.div>

        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
              <BookOpen size={36} />
            </div>
            <h2 className="mb-2 text-lg font-bold text-gray-900">No Tests Yet</h2>
            <p className="mx-auto max-w-xs text-sm font-medium text-gray-500">
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
                  className="group relative block overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem]"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl text-blue-600">
                      {test.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold leading-tight text-gray-900">
                        {test.title}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {test.questionCount} questions
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-400 transition-all duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRight
                        size={18}
                        strokeWidth={2.5}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}