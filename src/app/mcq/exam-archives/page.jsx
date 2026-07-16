"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, Download, Eye, X, ScrollText } from "lucide-react";
import examsData from "@/lib/exams-data.json";

export default function ExamArchivesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
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

  const handleDownload = (e, filePath) => {
    e.preventDefault();
    if (downloadingFile) return;
    
    if (filePath.startsWith('http')) {
      window.open(filePath, '_blank');
      return;
    }
    
    setDownloadingFile(filePath);
    
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${filePath}?download=1`;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      setDownloadingFile(null);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 md:p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

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
            <ScrollText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Exam Archives
            </h1>
            <p className="text-sm font-medium text-gray-500">Subject-wise tests and Mock tests</p>
          </div>
        </motion.div>

        {/* 2-Column Grid Folders */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {examsData.map((subjectData, index) => (
            <motion.div
              key={subjectData.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedSubject(subjectData)}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                <Folder size={32} fill="currentColor" className="opacity-20" />
                <Folder size={32} className="absolute" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 line-clamp-2">
                {subjectData.subject}
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {subjectData.files.length} {subjectData.files.length === 1 ? 'File' : 'Files'}
              </p>
            </motion.div>
          ))}
        </div>
        
        {examsData.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No exam archives available at the moment.
          </div>
        )}
      </div>

      {/* Subject Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubject(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-2xl sm:h-[85vh] sm:rounded-[2rem]"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(30,50,90,0.06)] bg-white/90 p-4 backdrop-blur-md sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedSubject.subject}</h2>
                    <p className="mt-0.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      {selectedSubject.files.length} {selectedSubject.files.length === 1 ? 'File' : 'Files'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all active:scale-95 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* PDF Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedSubject.files.map((file) => (
                    <div
                      key={file.path}
                      className="flex flex-col rounded-2xl border border-[rgba(30,50,90,0.05)] bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-[rgba(30,50,90,0.05)]">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
                            {file.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="inline-flex rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                              {file.categoryType === 'mock test' ? 'Mock Test' : 'Subject Wise Test'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto flex gap-2">
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[rgba(30,50,90,0.05)] py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:text-blue-600 active:scale-95"
                        >
                          <Eye size={16} />
                          View
                        </a>
                        <button
                          onClick={(e) => handleDownload(e, file.path)}
                          disabled={downloadingFile === file.path}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 ${
                            downloadingFile === file.path
                              ? "cursor-not-allowed bg-blue-400"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {downloadingFile === file.path ? (
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
