"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlayCircle,
  PersonStanding,
  Activity,
  FlaskConical,
  Microscope,
  Bug,
  Pill,
  Skull,
  Users,
  Stethoscope,
  Scissors,
  Baby,
  Smile,
  Eye,
  Ear,
  Bone,
  Wind,
  Fingerprint,
  Brain,
  Zap,
  Dna,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function SeriesCard({ title, videos, itemVariants, watchedIds = [] }) {
  const seriesUrl = `/series/${encodeURIComponent(title)}`;

  const watchedSet = useMemo(() => new Set(watchedIds), [watchedIds]);
  const watchedCount = videos.filter((v) => watchedSet.has(v.$id)).length;
  const totalCount = videos.length;
  const progressPercent =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && watchedCount === totalCount;

  const getSeriesIcon = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes("anatomy")) return <PersonStanding strokeWidth={1.5} size={26} />;
    if (lower.includes("physio")) return <Activity strokeWidth={1.5} size={26} />;
    if (lower.includes("biochem")) return <FlaskConical strokeWidth={1.5} size={26} />;
    if (lower.includes("patho")) return <Microscope strokeWidth={1.5} size={26} />;
    if (lower.includes("microbio")) return <Bug strokeWidth={1.5} size={26} />;
    if (lower.includes("pharma")) return <Pill strokeWidth={1.5} size={26} />;
    if (lower.includes("forensic")) return <Skull strokeWidth={1.5} size={26} />;
    if (lower.includes("community")) return <Users strokeWidth={1.5} size={26} />;
    if (lower.includes("medicine")) return <Stethoscope strokeWidth={1.5} size={26} />;
    if (lower.includes("surgery")) return <Scissors strokeWidth={1.5} size={26} />;
    if (lower.includes("pediatric")) return <Baby strokeWidth={1.5} size={26} />;
    if (lower.includes("obg")) return <Smile strokeWidth={1.5} size={26} />;
    if (lower.includes("ophthalmology")) return <Eye strokeWidth={1.5} size={26} />;
    if (lower.includes("ent")) return <Ear strokeWidth={1.5} size={26} />;
    if (lower.includes("orthopedics")) return <Bone strokeWidth={1.5} size={26} />;
    if (lower.includes("anesthesiology")) return <Wind strokeWidth={1.5} size={26} />;
    if (lower.includes("dermatology")) return <Fingerprint strokeWidth={1.5} size={26} />;
    if (lower.includes("psychiatry")) return <Brain strokeWidth={1.5} size={26} />;
    if (lower.includes("radio")) return <Zap strokeWidth={1.5} size={26} />;
    return <Dna strokeWidth={1.5} size={26} />;
  };

  if (videos.length === 0) {
    return (
      <motion.div variants={itemVariants}>
        <div className="flex cursor-not-allowed items-center gap-4 rounded-2xl border border-[rgba(30,50,90,0.05)] bg-gray-50/60 p-4 opacity-60 grayscale md:gap-5 md:p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
            {getSeriesIcon(title)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-500 md:text-lg">
              {title}
            </h3>
            <p className="mt-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Coming Soon
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Link href={seriesUrl} className="group block">
        <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:gap-5 md:p-5">
          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-105 md:h-16 md:w-16 ${
              isComplete
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : "border-blue-100 bg-blue-50 text-blue-600"
            }`}
          >
            {getSeriesIcon(title)}
            {isComplete && (
              <div className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 p-0.5 text-white shadow-sm">
                <CheckCircle size={14} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 md:text-lg">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {watchedCount} / {totalCount} Videos
              </span>
              {progressPercent > 0 && !isComplete && (
                <span className="text-xs font-bold text-blue-600">
                  {progressPercent}%
                </span>
              )}
            </div>

            {totalCount > 0 && !isComplete && (
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-blue-600"
                />
              </div>
            )}
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-400 transition-all duration-300 group-active:scale-95 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
            <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
          </div>
          <PlayCircle className="hidden" />
        </div>
      </Link>
    </motion.div>
  );
}