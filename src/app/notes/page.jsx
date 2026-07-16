"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, Download, Eye, ChevronDown } from "lucide-react";
import notesData from "@/lib/notes-data.json";

export default function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(notesData[0]?.subject || null);
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

  const toggleSubject = (subject) => {
    if (expandedSubject === subject) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subject);
    }
  };

  const handleDownload = (e, filePath) => {
    e.preventDefault();
    if (downloadingFile) return;
    
    // For external URLs, we must bypass the proxy iframe and just open them directly
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
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Notes
            </h1>
            <p className="text-sm font-medium text-gray-500">Subject-wise workbooks and materials</p>
          </div>
        </motion.div>

        {/* Subjects Accordion */}
        <div className="flex flex-col gap-4">
          {notesData.map((subjectData, index) => {
            const isExpanded = expandedSubject === subjectData.subject;
            
            return (
              <motion.div
                key={subjectData.subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-sm transition-all md:rounded-[2rem]"
              >
                <button
                  onClick={() => toggleSubject(subjectData.subject)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 md:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                        {subjectData.subject}
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        {subjectData.files.length} {subjectData.files.length === 1 ? 'File' : 'Files'}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180 bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[rgba(30,50,90,0.05)]"
                    >
                      <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                        {subjectData.files.map((file) => (
                          <div
                            key={file.path}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                          >
                            <div className="mb-4 flex items-start gap-3">
                              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                <FileText size={20} />
                              </div>
                              <div>
                                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
                                  {file.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {file.categoryType !== 'written' && (
                                    <span className="inline-flex rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                      {file.categoryType}
                                    </span>
                                  )}
                                  {file.categoryType === 'workbooks' && (
                                    <span className="inline-flex rounded-md bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                      Unwritten
                                    </span>
                                  )}
                                  {file.categoryType === 'written' && (
                                    <>
                                      <span className="inline-flex rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                        Workbooks
                                      </span>
                                      <span className="inline-flex rounded-md bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        Written
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-auto flex gap-2">
                              <a
                                href={file.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:text-blue-600"
                              >
                                <Eye size={16} />
                                View
                              </a>
                              <button
                                onClick={(e) => handleDownload(e, file.path)}
                                disabled={downloadingFile === file.path}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        {notesData.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No notes available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
