"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function VideoCard({ video, itemVariants }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/watch/${video.$id}`} className="group relative block">
        <article className="panel card-hover-lift overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="bg-primary absolute inset-0" />
            <div className="absolute top-2 right-2 rounded border border-white/10 bg-black/70 px-2 py-1 text-[10px] font-bold text-white/90">
              {video.duration}
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <Play size={20} fill="white" className="ml-1" />
              </div>
            </div>
          </div>

          <div className="p-5">
            <span className="tag">{video.category}</span>
            <h3 className="group-hover:text-primary mt-3 mb-2 text-lg leading-tight font-bold text-gray-900 transition-colors">
              {video.title}
            </h3>
            <p className="text-muted line-clamp-2 text-xs leading-relaxed">
              {video.description}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
