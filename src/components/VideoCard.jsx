"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function VideoCard({ video, itemVariants }) {
    return (
        <motion.div variants={itemVariants}>
            <Link href={`/watch/${video.$id}`} className="group block relative">
                <article className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover-lift">
                    <div className="aspect-video relative overflow-hidden">
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                            {video.duration}
                        </div>

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                <Play size={20} fill="white" className="ml-1" />
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full">{video.category}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 leading-tight text-gray-100 group-hover:text-primary transition-colors">
                            {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {video.description}
                        </p>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}
