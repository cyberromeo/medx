"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Target,
  Award,
  BookOpen,
  FileText,
  Check,
  PlaySquare,
} from "lucide-react";
import {
  getTrackerData,
  updateSubjectTracker,
  updateGTTracker,
  SUBJECTS_LIST,
} from "@/lib/tracker";

const TOTAL_ITEMS = 19 * 6 + 7;

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
    setData((prev) => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: {
          ...prev.subjects[subject],
          [field]: !currentValue,
        },
      },
    }));
    await updateSubjectTracker(user.uid, subject, field, !currentValue);
  };

  const handleGTChange = async (gt, currentValue) => {
    setData((prev) => ({
      ...prev,
      gts: {
        ...prev.gts,
        [gt]: !currentValue,
      },
    }));
    await updateGTTracker(user.uid, gt, !currentValue);
  };

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  let completedCount = 0;
  SUBJECTS_LIST.forEach((sub) => {
    if (data.subjects[sub]?.Videos) completedCount++;
    if (data.subjects[sub]?.R1) completedCount++;
    if (data.subjects[sub]?.R2) completedCount++;
    if (data.subjects[sub]?.PYQs) completedCount++;
    if (data.subjects[sub]?.RevisionVideos) completedCount++;
    if (data.subjects[sub]?.Qbank) completedCount++;
  });
  Object.keys(data.gts).forEach((gt) => {
    if (data.gts[gt]) completedCount++;
  });

  const progressPercentage = Math.round((completedCount / TOTAL_ITEMS) * 100) || 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 pb-32 md:p-10 md:pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Progress header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-[2rem] md:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 md:text-2xl">
                <Target className="shrink-0 text-blue-600" size={22} />
                FMGE Tracker
              </h1>
              <p className="mt-1 hidden text-sm font-medium text-gray-500 md:block">
                Track your revisions, PYQs, Qbanks, and GTs.
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500 md:hidden">
                {completedCount} / {TOTAL_ITEMS} completed
              </p>
            </div>
            <div className="flex items-baseline gap-2 self-end sm:self-auto">
              <span className="text-3xl font-bold leading-none text-blue-600 md:text-4xl">
                {progressPercentage}%
              </span>
              <span className="hidden text-xs font-semibold tracking-wider text-gray-500 uppercase md:inline">
                Completed
              </span>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100 md:h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-blue-600"
            />
          </div>
        </motion.div>

        {/* Grand Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-2">
            <Award className="text-amber-500" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Grand Tests (GTs)</h2>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-[2rem] md:p-6">
            <div className="grid grid-cols-2 grid-rows-4 gap-3 sm:grid-cols-4 sm:grid-rows-2 md:grid-cols-7 md:grid-rows-1 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const gtKey = `GT${num}`;
                const isChecked = data.gts[gtKey];
                return (
                  <button
                    key={gtKey}
                    onClick={() => handleGTChange(gtKey, isChecked)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                      isChecked
                        ? "border-amber-200 bg-amber-50 shadow-sm"
                        : "border-[rgba(30,50,90,0.05)] bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isChecked
                          ? "bg-amber-500 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {isChecked ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <span className="font-bold">{num}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isChecked ? "text-amber-600" : "text-gray-500"
                      }`}
                    >
                      GT {num}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Subjects */}
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">19 Subjects</h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
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

            const subCompleted = items.filter((i) => subData[i.key]).length;
            const subProgress = Math.round((subCompleted / 6) * 100);

            return (
              <motion.div
                key={subject}
                variants={item}
                className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:p-6"
              >
                <div
                  className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500"
                  style={{ width: `${subProgress}%` }}
                />

                <div className="mb-5 flex items-start justify-between">
                  <h3 className="pr-4 text-lg font-bold leading-tight text-gray-900">
                    {subject}
                  </h3>
                  <div className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                    {subCompleted}/6
                  </div>
                </div>

                <div className="space-y-2.5">
                  {items.map((it) => {
                    const isChecked = subData[it.key];
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.key}
                        onClick={() =>
                          handleSubjectChange(subject, it.key, isChecked)
                        }
                        className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all ${
                          isChecked
                            ? "border-blue-200 bg-blue-50/60"
                            : "border-[rgba(30,50,90,0.05)] bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={16}
                            className={isChecked ? "text-blue-500" : "text-gray-400"}
                          />
                          <span
                            className={`text-sm font-semibold ${
                              isChecked ? "text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {it.label}
                          </span>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                            isChecked ? "bg-blue-600 text-white" : "bg-gray-200"
                          }`}
                        >
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