"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  LogOut,
  Video,
  Lock,
  Users,
  Activity,
  Search,
  ExternalLink,
  Upload,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { getAdminStats } from "@/actions/admin";
import Link from "next/link";

const MIST_SUBJECTS = [
  "Anatomy",
  "Physiology",
  "Biochemistry",
  "Pathology",
  "Microbiology",
  "Pharmacology",
  "Forensic Medicine (FMT)",
  "Community Medicine (PSM)",
  "General Medicine",
  "General Surgery",
  "Obstetrics & Gynecology (OBG)",
  "Pediatrics",
  "Ophthalmology",
  "Otorhinolaryngology (ENT)",
  "Orthopedics",
  "Anesthesiology",
  "Dermatology & Venereology",
  "Psychiatry",
  "Radiodiagnosis (Radiology)",
];

const MIST_2026_SUBJECTS = [
  "ANATOMY", "ANATOMY REVISION", "PATHOLOGY", "PHYSIOLOGY", "ANESTHESIA", "OPHTHALMOLOGY", 
  "FORENSIC MEDICINE", "ENT", "PSYCHIATRY", "MEDICINE - DR. KUNAL", 
  "OB GYNE", "PAEDIATRICS", "RADIOLOGY", "BIOCHEMISTRY", "ORTHOPAEDIC", 
  "DERMATOLOGY", "PHARMACOLOGY", "MICROBIOLOGY", "MEDICINE BY DR.SINGARAM", 
  "PSM", "SURGERY"
];

export default function AdminPage() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("MIST");
  const [subCategory, setSubCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      fetchVideos();
    });
    loadStats();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, filterCategory]);

  const loadStats = async () => {
    const data = await getAdminStats();
    setStats(data);
  };

  const fetchVideos = async () => {
    try {
      const q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc"),
        limit(500),
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ $id: doc.id, ...doc.data() }));
      setVideos(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const filterVideos = () => {
    let result = [...videos];

    if (searchQuery) {
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.subCategory?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((v) => v.category === filterCategory);
    }

    setFilteredVideos(result);
  };

  const addVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "videos"), {
        title,
        description,
        videoId,
        thumbnailUrl:
          thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        category,
        subCategory: subCategory || "General",
        duration,
        createdAt: new Date().toISOString(),
      });
      fetchVideos();
      loadStats();
      setTitle("");
      setDescription("");
      setVideoId("");
      setThumbnailUrl("");
      setSubCategory("");
      setDuration("");
      setSuccess("Video added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const deleteVideo = async (id, videoTitle) => {
    if (!confirm(`Delete "${videoTitle}"?`)) return;
    try {
      await deleteDoc(doc(db, "videos", id));
      fetchVideos();
      loadStats();
      setSuccess("Video deleted");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "Cyber@9789") {
      setIsAdminAuthenticated(true);
    } else {
      setError("Incorrect password");
      setTimeout(() => setError(""), 2000);
    }
  };

  const autoFillFromYouTube = () => {
    if (videoId) {
      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  };

  // Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel relative z-10 w-full max-w-md rounded-3xl p-8 text-center"
        >
          <div className="grad-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-muted mb-8">
            Enter credentials to access the dashboard
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              className="input text-center"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="grad-primary w-full rounded-xl py-4 font-bold text-white transition-opacity hover:opacity-90"
            >
              Unlock Dashboard
            </button>
          </form>

          <Link
            href="/"
            className="text-muted mt-6 block text-sm transition-colors hover:text-white"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="halo-bg" />
      <div className="grid-bg" />

      {/* Toast Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-6 py-4 ${
              error
                ? "border border-red-500/50 bg-red-500/20 text-red-400"
                : "border border-green-500/50 bg-green-500/20 text-green-400"
            }`}
          >
            {error ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="grad-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                Manage your content library
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
            >
              View Site
            </Link>
            <button
              onClick={() => setIsAdminAuthenticated(false)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Exit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <Activity className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Now</p>
                <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              </div>
              <div className="ml-auto">
                <span className="relative flex h-3 w-3">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative h-3 w-3 rounded-full bg-green-500"></span>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Video className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Videos</p>
                <h3 className="text-2xl font-bold">{stats.totalVideos}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search videos..."
              className="input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="MIST">MIST</option>
              <option value="MIST_2026">MIST JUNE 2026</option>
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="grad-primary flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={20} />
              Add Video
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="panel group overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="bg-primary absolute inset-0" />
                <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  {video.duration}
                </span>
                <a
                  href={`https://youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 rounded-lg bg-white/10 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/20"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">
                      {video.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          video.category === "MIST"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {video.category}
                      </span>
                      <span className="truncate text-xs text-gray-500">
                        {video.subCategory}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteVideo(video.$id, video.title)}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="py-20 text-center">
            <Video size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No videos found</p>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Upload className="text-primary" size={24} />
                  Add New Video
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addVideo} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-400">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Video title"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Category
                    </label>
                    <select
                      required
                      className="select"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubCategory("");
                      }}
                    >
                      <option value="MIST">MIST</option>
                      <option value="MIST_2026">MIST JUNE 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Subject
                    </label>
                    <select
                      required
                      className="select"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {(category === "MIST_2026" ? MIST_2026_SUBJECTS : MIST_SUBJECTS).map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      YouTube ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="dQw4w9WgXcQ"
                      className="input"
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      onBlur={autoFillFromYouTube}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Duration
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10:05"
                      className="input"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-400">
                    Thumbnail URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Auto-generated from YouTube ID"
                    className="input"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-400">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Brief description..."
                    className="input resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Preview */}
                {videoId && (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="mb-2 text-xs text-gray-500">Preview</p>
                    <img
                      src={
                        thumbnailUrl ||
                        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      }
                      alt="Thumbnail preview"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="grad-primary w-full rounded-xl py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Video"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
