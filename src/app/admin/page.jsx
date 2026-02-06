"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2, Plus, LogOut, Video, Lock, Users, Activity,
    Search, ExternalLink, Upload,
    Stethoscope, AlertCircle, CheckCircle, X
} from "lucide-react";
import { getAdminStats } from "@/actions/admin";
import Link from "next/link";

const MIST_SUBJECTS = [
    "Anatomy", "Physiology", "Biochemistry", "Pathology",
    "Microbiology", "Pharmacology", "Forensic Medicine (FMT)",
    "Community Medicine (PSM)", "General Medicine", "General Surgery",
    "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
    "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
    "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
];

const ARISE_SUBJECTS = [
    "Clinical Skills", "Case Studies", "Exam Preparation", "General"
];

export default function AdminPage() {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalVideos: 0 });
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

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

    useEffect(() => {
        checkSession();
        loadStats();
    }, []);

    useEffect(() => {
        filterVideos();
    }, [videos, searchQuery, filterCategory]);

    const loadStats = async () => {
        const data = await getAdminStats();
        setStats(data);
    };

    const checkSession = async () => {
        try {
            await account.get();
        } catch {

        }
        fetchVideos();
    };

    const fetchVideos = async () => {
        if (!DB_ID || !COL_ID) return;
        try {
            const response = await databases.listDocuments(DB_ID, COL_ID, [
                Query.orderDesc("$createdAt"),
                Query.limit(500)
            ]);
            setVideos(response.documents);
        } catch (err) {
            console.error(err);
        }
    };

    const filterVideos = () => {
        let result = [...videos];

        if (searchQuery) {
            result = result.filter(v =>
                v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterCategory !== "all") {
            result = result.filter(v => v.category === filterCategory);
        }

        setFilteredVideos(result);
    };

    const addVideo = async (e) => {
        e.preventDefault();
        if (!DB_ID || !COL_ID) {
            setError("Database config missing");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
                title,
                description,
                videoId,
                thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                category,
                subCategory: subCategory || "General",
                duration,
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
            await databases.deleteDocument(DB_ID, COL_ID, id);
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
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
                <div className="halo-bg" />
                <div className="grid-bg" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="panel rounded-3xl p-8 max-w-md w-full text-center relative z-10"
                >
                    <div className="w-16 h-16 grad-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
                    <p className="text-muted mb-8">Enter credentials to access the dashboard</p>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className="input text-center"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full grad-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Unlock Dashboard
                        </button>
                    </form>

                    <Link href="/" className="text-muted text-sm mt-6 block hover:text-white transition-colors">
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
                        className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl flex items-center gap-3 ${error ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-green-500/20 border border-green-500/50 text-green-400'
                            }`}
                    >
                        {error ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        {error || success}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 grad-primary rounded-xl flex items-center justify-center">
                            <Stethoscope size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm">Manage your content library</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                            View Site
                        </Link>
                        <button
                            onClick={() => setIsAdminAuthenticated(false)}
                            className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Exit
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="panel p-5 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="panel p-5 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Activity className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Active Now</p>
                                <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
                            </div>
                            <div className="ml-auto">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="panel p-5 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Video className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total Videos</p>
                                <h3 className="text-2xl font-bold">{stats.totalVideos}</h3>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
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
                            <option value="ARISE">ARISE</option>
                        </select>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="grad-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add Video
                        </button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVideos.map((video, index) => (
                        <motion.div
                            key={video.$id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="panel rounded-2xl overflow-hidden group"
                        >
                            <div className="relative aspect-video bg-black">
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                </span>
                                <a
                                    href={`https://youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{video.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${video.category === 'MIST'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {video.category}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                                {video.subCategory}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteVideo(video.$id, video.title)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredVideos.length === 0 && (
                    <div className="text-center py-20">
                        <Video size={48} className="mx-auto text-gray-600 mb-4" />
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="panel p-6 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Upload className="text-primary" size={24} />
                                    Add New Video
                                </h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={addVideo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
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
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                        <select
                                            required
                                            className="select"
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }}
                                        >
                                            <option value="MIST">MIST</option>
                                            <option value="ARISE">ARISE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                        <select
                                            required
                                            className="select"
                                            value={subCategory}
                                            onChange={(e) => setSubCategory(e.target.value)}
                                        >
                                            <option value="">Select Subject</option>
                                            {(category === "MIST" ? MIST_SUBJECTS : ARISE_SUBJECTS).map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">YouTube ID</label>
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
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
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
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Thumbnail URL (optional)</label>
                                    <input
                                        type="url"
                                        placeholder="Auto-generated from YouTube ID"
                                        className="input"
                                        value={thumbnailUrl}
                                        onChange={(e) => setThumbnailUrl(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
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
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-2">Preview</p>
                                        <img
                                            src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                            alt="Thumbnail preview"
                                            className="w-full aspect-video object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full grad-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
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


