"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, Download, Eye, ArrowRight } from "lucide-react";
import notesData from "@/lib/notes-data.json";

export default function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("workbooks");
  const [downloadingFile, setDownloadingFile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDownload = async (e, filePath, fileName) => {
    e.preventDefault();
    if (downloadingFile) return;
    
    setDownloadingFile(filePath);
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Network response was not ok");
      
      // Force iOS to download by changing the MIME type to octet-stream
      const originalBlob = await response.blob();
      const blob = new Blob([originalBlob], { type: "application/octet-stream" });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.target = "_blank"; // Helps on some iOS versions
      document.body.appendChild(link);
      link.click();
      
      // Delay cleanup to ensure iOS has time to process the download
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  const currentNotes = notesData[activeTab] || [];

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Notes
            </h1>
            <p className="text-sm font-medium text-gray-500">Access workbooks and miscellaneous files</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("workbooks")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "workbooks"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Workbooks ({notesData.workbooks.length})
          </button>
          <button
            onClick={() => setActiveTab("miscellaneous")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "miscellaneous"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Miscellaneous ({notesData.miscellaneous.length})
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {currentNotes.map((note, index) => (
              <motion.div
                key={note.path}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:rounded-[2rem]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={22} />
                  </div>
                  <div className="flex-1">
                    <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {note.subject}
                    </span>
                  </div>
                </div>
                
                <h3 className="mb-2 line-clamp-2 text-base font-bold leading-tight text-gray-900">
                  {note.name}
                </h3>
                
                <div className="mt-auto flex gap-2 pt-4">
                  <a
                    href={note.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-50 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-white hover:text-blue-600 border border-transparent hover:border-blue-100"
                  >
                    <Eye size={16} />
                    View
                  </a>
                  <button
                    onClick={(e) => handleDownload(e, note.path, note.name)}
                    disabled={downloadingFile === note.path}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                      downloadingFile === note.path
                        ? "cursor-not-allowed bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {downloadingFile === note.path ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Wait...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {currentNotes.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No PDFs found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
