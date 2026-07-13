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

export default function SeriesCard({
  title,
  videos,
  itemVariants,
  watchedIds = [],
}) {
  const seriesUrl = `/series/${encodeURIComponent(title)}`;

  const watchedSet = useMemo(() => new Set(watchedIds), [watchedIds]);
  const watchedCount = videos.filter((v) => watchedSet.has(v.$id)).length;
  const totalCount = videos.length;
  const progressPercent =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && watchedCount === totalCount;

  const getSeriesIcon = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes("anatomy")) return <PersonStanding strokeWidth={1.5} size={28} />;
    if (lower.includes("physio")) return <Activity strokeWidth={1.5} size={28} />;
    if (lower.includes("biochem")) return <FlaskConical strokeWidth={1.5} size={28} />;
    if (lower.includes("patho")) return <Microscope strokeWidth={1.5} size={28} />;
    if (lower.includes("microbio")) return <Bug strokeWidth={1.5} size={28} />;
    if (lower.includes("pharma")) return <Pill strokeWidth={1.5} size={28} />;
    if (lower.includes("forensic")) return <Skull strokeWidth={1.5} size={28} />;
    if (lower.includes("community")) return <Users strokeWidth={1.5} size={28} />;
    if (lower.includes("medicine")) return <Stethoscope strokeWidth={1.5} size={28} />;
    if (lower.includes("surgery")) return <Scissors strokeWidth={1.5} size={28} />;
    if (lower.includes("pediatric")) return <Baby strokeWidth={1.5} size={28} />;
    if (lower.includes("obg")) return <Smile strokeWidth={1.5} size={28} />;
    if (lower.includes("ophthalmology")) return <Eye strokeWidth={1.5} size={28} />;
    if (lower.includes("ent")) return <Ear strokeWidth={1.5} size={28} />;
    if (lower.includes("orthopedics")) return <Bone strokeWidth={1.5} size={28} />;
    if (lower.includes("anesthesiology")) return <Wind strokeWidth={1.5} size={28} />;
    if (lower.includes("dermatology")) return <Fingerprint strokeWidth={1.5} size={28} />;
    if (lower.includes("psychiatry")) return <Brain strokeWidth={1.5} size={28} />;
    if (lower.includes("radio")) return <Zap strokeWidth={1.5} size={28} />;

    return <Dna strokeWidth={1.5} size={28} />;
  };

  return (
    <motion.div variants={itemVariants}>
      {videos.length > 0 ? (
        <Link
          href={seriesUrl}
          className="group block"
        >
          <div className="bg-white/60 backdrop-blur-xl border border-[#898989]/20 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white transition-all duration-300 rounded-[1.5rem] p-4 sm:p-5 flex items-center gap-4 sm:gap-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl transition-colors duration-500 group-hover:bg-blue-200/50" />
            
            {/* Icon Box */}
            <div className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 z-10 ${isComplete ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
              {getSeriesIcon(title)}
              {isComplete && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                  <CheckCircle size={14} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 z-10">
              <h3 className="text-base sm:text-lg font-bold text-[#303030] truncate transition-colors group-hover:text-blue-600">
                {title}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-bold text-[#898989] uppercase tracking-wider">
                  {watchedCount} / {totalCount} Videos
                </span>
                {progressPercent > 0 && !isComplete && (
                   <span className="text-xs font-bold text-blue-500">
                     {progressPercent}%
                   </span>
                )}
              </div>

              {/* Minimal Progress Bar */}
              {totalCount > 0 && !isComplete && (
                <div className="mt-2.5 w-full bg-[#898989]/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-blue-500 h-full rounded-full"
                  />
                </div>
              )}
            </div>

            {/* CTA Arrow */}
            <div className="shrink-0 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white group-hover:shadow-md text-[#898989] group-active:scale-95">
              <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-4 sm:gap-6 bg-[#f9f9f9]/80 backdrop-blur-sm border border-[#898989]/10 rounded-[1.5rem] p-4 sm:p-5 opacity-60 cursor-not-allowed grayscale">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl flex items-center justify-center bg-gray-200 text-gray-500 shadow-sm z-10">
              {getSeriesIcon(title)}
            </div>
            <div className="flex-1 min-w-0 z-10">
              <h3 className="text-base sm:text-lg font-bold text-gray-700 truncate">
                {title}
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1.5">
                Coming Soon
              </p>
            </div>
        </div>
      )}
    </motion.div>
  );
}
