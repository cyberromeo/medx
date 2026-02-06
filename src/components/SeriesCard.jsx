"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlayCircle, PersonStanding, Activity, FlaskConical, Microscope, Bug, Pill,
  Skull, Users, Stethoscope, Scissors, Baby, Smile, Eye, Ear, Bone,
  Wind, Fingerprint, Brain, Zap, Dna, CheckCircle
} from "lucide-react";

export default function SeriesCard({ title, videos, itemVariants, watchedIds = [] }) {
  const seriesUrl = `/series/${encodeURIComponent(title)}`;

  const watchedSet = useMemo(() => new Set(watchedIds), [watchedIds]);
  const watchedCount = videos.filter(v => watchedSet.has(v.$id)).length;
  const totalCount = videos.length;
  const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && watchedCount === totalCount;

  const getSeriesIcon = (name) => {
    const lower = name.toLowerCase();

    if (lower.includes("anatomy")) return <PersonStanding strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("physio")) return <Activity strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("biochem")) return <FlaskConical strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("patho")) return <Microscope strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("microbio")) return <Bug strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("pharma")) return <Pill strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("forensic")) return <Skull strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("community")) return <Users strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("general medicine")) return <Stethoscope strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("surgery")) return <Scissors strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("obstetrics") || lower.includes("obg")) return <Baby strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("pediatrics")) return <Smile strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("ophthalmology")) return <Eye strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("ent") || lower.includes("otorhino")) return <Ear strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("orthopedics")) return <Bone strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("anesthesiology")) return <Wind strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("dermatology")) return <Fingerprint strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("psychiatry")) return <Brain strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
    if (lower.includes("radio")) return <Zap strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;

    return <Dna strokeWidth={1.5} className="w-9 h-9 md:w-11 md:h-11 text-white/30 group-hover:text-primary transition-colors" />;
  };

  return (
    <motion.div variants={itemVariants}>
      {videos.length > 0 ? (
        <Link href={seriesUrl} className="group flex flex-col items-center gap-3">
          <div className={`panel relative w-full aspect-square max-w-[120px] md:max-w-[140px] rounded-2xl md:rounded-[2rem] overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(4,3,19,0.62)] ${isComplete ? "border border-secondary-soft" : ""}`}>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
              {getSeriesIcon(title)}
            </div>

            {totalCount > 0 && (
              <div className="absolute bottom-2 right-2">
                <div className="relative w-8 h-8">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke={isComplete ? "#db1fff" : "#7030ef"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(progressPercent / 100) * 75.4} 75.4`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isComplete ? (
                      <CheckCircle size={12} className="text-secondary" />
                    ) : (
                      <span className="text-[8px] font-bold text-primary">{progressPercent}%</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="absolute top-2 left-2 bg-secondary/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <CheckCircle size={8} />
                DONE
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <PlayCircle size={34} className="text-primary drop-shadow-[0_0_12px_rgba(219,31,255,0.72)]" />
            </div>
          </div>

          <div className="text-center w-full px-1">
            <h3 className="text-[11px] md:text-xs font-semibold text-white/80 group-hover:text-primary transition-all duration-300 line-clamp-2 leading-tight">
              {title}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? "bg-secondary" : "bg-primary"}`} />
              <p className="text-[9px] text-muted font-medium">
                {watchedCount}/{totalCount}
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-2 opacity-40 cursor-not-allowed">
          <div className="panel relative w-full aspect-square max-w-[120px] md:max-w-[140px] rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/5">
            <div className="w-full h-full flex items-center justify-center text-white/10">
              {getSeriesIcon(title)}
            </div>
          </div>

          <div className="text-center w-full px-1">
            <h3 className="text-[11px] md:text-xs font-semibold text-muted leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-[9px] text-muted mt-0.5">
              Coming Soon
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
