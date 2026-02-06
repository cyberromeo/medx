"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function VideoCard({ video, itemVariants }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/watch/${video.$id}`} className="group block relative">
        <article className="panel rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-2 right-2 bg-black/70 text-white/90 text-[10px] font-bold px-2 py-1 rounded border border-white/10">
              {video.duration}
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Play size={20} fill="white" className="ml-1" />
              </div>
            </div>
          </div>

          <div className="p-5">
            <span className="tag">{video.category}</span>
            <h3 className="text-lg font-bold mt-3 mb-2 leading-tight text-white group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
