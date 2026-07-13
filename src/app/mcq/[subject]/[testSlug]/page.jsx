"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  BookOpen,
  Timer,
  Target,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getTestBySlug, getQuestionsByTestId } from "@/lib/mcq";

// ─── Helpers ────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── Main Page ──────────────────────────────────────────
export default function McqTestPage() {
  const router = useRouter();
  const { subject: subcategorySlug, testSlug } = useParams();
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Mode: null = selection screen, "exam", "revision"
  const [mode, setMode] = useState(null);
  const [started, setStarted] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIndex: optionIndex }
  const [showResult, setShowResult] = useState(false);
  const [revisionRevealed, setRevisionRevealed] = useState(false);

  // Timers
  const [globalTimer, setGlobalTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(60);
  const globalIntervalRef = useRef(null);
  const questionIntervalRef = useRef(null);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch test & questions from Appwrite
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const t = await getTestBySlug(testSlug);
      setTest(t);
      if (t) {
        const q = await getQuestionsByTestId(t.id);
        setQuestions(q);
      }
      setDataLoading(false);
    })();
  }, [authLoading, testSlug]);

  // ─── Exam Timer ─────────────────────────────────────
  useEffect(() => {
    if (mode !== "exam" || !started || showResult) return;
    globalIntervalRef.current = setInterval(() => {
      setGlobalTimer((prev) => {
        if (prev <= 1) {
          clearInterval(globalIntervalRef.current);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(globalIntervalRef.current);
  }, [mode, started, showResult]);

  // ─── Revision Timer ─────────────────────────────────
  useEffect(() => {
    if (mode !== "revision" || !started || showResult || revisionRevealed)
      return;
    setQuestionTimer(60);
    setTimeExpired(false);
    questionIntervalRef.current = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(questionIntervalRef.current);
          setTimeExpired(true);
          setRevisionRevealed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(questionIntervalRef.current);
  }, [mode, started, currentQ, showResult, revisionRevealed]);

  // ─── Actions ────────────────────────────────────────
  const startQuiz = useCallback(
    (selectedMode) => {
      setMode(selectedMode);
      setStarted(true);
      setCurrentQ(0);
      setAnswers({});
      setShowResult(false);
      setRevisionRevealed(false);
      setTimeExpired(false);
      if (selectedMode === "exam") {
        setGlobalTimer(questions.length * 60);
      }
    },
    [questions.length],
  );

  const selectOption = useCallback(
    (optionIndex) => {
      if (mode === "exam") {
        setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
      } else if (mode === "revision" && !revisionRevealed) {
        clearInterval(questionIntervalRef.current);
        setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
        setRevisionRevealed(true);
      }
    },
    [mode, currentQ, revisionRevealed],
  );

  const goToQuestion = useCallback(
    (index) => {
      if (mode === "exam") {
        setCurrentQ(index);
      }
    },
    [mode],
  );

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setRevisionRevealed(false);
      setTimeExpired(false);
    } else {
      if (mode === "exam") {
        clearInterval(globalIntervalRef.current);
      }
      setShowResult(true);
    }
  }, [currentQ, questions.length, mode]);

  const prevQuestion = useCallback(() => {
    if (mode === "exam" && currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
    }
  }, [mode, currentQ]);

  const submitExam = useCallback(() => {
    clearInterval(globalIntervalRef.current);
    setShowResult(true);
  }, []);

  const resetQuiz = useCallback(() => {
    setMode(null);
    setStarted(false);
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setRevisionRevealed(false);
    setTimeExpired(false);
    setGlobalTimer(0);
    clearInterval(globalIntervalRef.current);
    clearInterval(questionIntervalRef.current);
  }, []);

  // ─── Score calc ─────────────────────────────────────
  const score = questions.reduce(
    (acc, q, i) => (answers[i] === q.correct ? acc + 1 : acc),
    0,
  );
  const attempted = Object.keys(answers).length;

  // ─── Loading / Not Found ────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f0f0f0]">
        <AlertCircle size={48} className="text-[#898989] mb-4" />
        <h1 className="mb-2 text-xl font-bold text-[#303030]">Test Not Found</h1>
        <Link href={`/mcq/${subcategorySlug}`} className="text-blue-600 text-sm">
          ← Back to Tests
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#f0f0f0]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#898989]/10">
          <BookOpen size={36} className="text-[#898989]" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#303030]">{test.title}</h1>
        <p className="text-[#898989] mb-6 max-w-xs">
          Questions for this test are coming soon. Check back later!
        </p>
        <Link
          href={`/mcq/${subcategorySlug}`}
          className="bg-white border border-[#898989]/20 shadow-sm inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#303030]"
        >
          <ChevronLeft size={16} />
          Back to Tests
        </Link>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // MODE SELECTION
  // ═══════════════════════════════════════════════════
  if (!started) {
    return (
      <main className="min-h-screen bg-[#f0f0f0] pb-20">
        <div className="container mx-auto max-w-lg px-4 pt-16">
          <Link
            href={`/mcq/${subcategorySlug}`}
            className="text-[#898989] mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-[#303030]"
          >
            <ChevronLeft size={16} />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-1 text-2xl font-bold text-[#303030]">
              {test.title}
            </h1>
            <p className="text-[#898989] text-sm font-medium">{questions.length} questions</p>
          </motion.div>

          <div className="space-y-4">
            {/* Exam Mode Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => startQuiz("exam")}
              className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm hover:shadow-md hover:border-blue-300 relative w-full overflow-hidden rounded-[1.5rem] p-6 text-left transition-all active:scale-[0.98]"
            >
              <div className="bg-blue-100 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 mb-3 flex items-center gap-4">
                <div className="bg-blue-600 shadow-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                  <Timer size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#303030]">Exam Mode</h2>
                  <p className="text-[#898989] font-medium text-xs">
                    Simulate real exam conditions
                  </p>
                </div>
              </div>
              <div className="text-[#5E6470] relative z-10 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600 shrink-0" />
                  <span>
                    Timer: {questions.length} min for {questions.length}{" "}
                    questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-blue-600 shrink-0" />
                  <span>Results & explanations shown after completion</span>
                </div>
              </div>
            </motion.button>

            {/* Revision Mode Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => startQuiz("revision")}
              className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm hover:shadow-md hover:border-blue-300 relative w-full overflow-hidden rounded-[1.5rem] p-6 text-left transition-all active:scale-[0.98]"
            >
              <div className="bg-emerald-100 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 mb-3 flex items-center gap-4">
                <div className="bg-emerald-500 shadow-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#303030]">
                    Revision Mode
                  </h2>
                  <p className="text-[#898989] font-medium text-xs">Learn at your own pace</p>
                </div>
              </div>
              <div className="text-[#5E6470] relative z-10 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-emerald-500 shrink-0" />
                  <span>1 minute per question</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span>Instant answer & explanation after each question</span>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════
  if (showResult) {
    const percentage =
      questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const timeUsed =
      mode === "exam" ? questions.length * 60 - globalTimer : null;

    return (
      <main className="min-h-screen bg-[#f0f0f0] pb-20">
        <div className="container mx-auto max-w-2xl px-4 pt-12">
          {/* Score Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 text-center"
          >
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border shadow-sm ${percentage >= 60 ? "bg-amber-50 border-amber-200 text-amber-500" : "bg-white border-[#898989]/20 text-[#898989]"}`}>
              <Trophy size={40} />
            </div>
            <h1 className="mb-1 text-3xl font-bold text-[#303030]">
              {percentage >= 80
                ? "Excellent! 🎉"
                : percentage >= 60
                  ? "Good Job! 👏"
                  : percentage >= 40
                    ? "Keep Trying! 💪"
                    : "Don't Give Up! 📚"}
            </h1>
            <p className="text-[#5E6470] font-medium">
              {test.title} — {mode === "exam" ? "Exam" : "Revision"} Mode
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-3 gap-3"
          >
            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm rounded-2xl p-4 text-center">
              <p className="text-blue-600 font-mono text-2xl font-bold">
                {score}/{questions.length}
              </p>
              <p className="text-[#898989] font-bold uppercase tracking-wider mt-1 text-[10px]">Correct</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm rounded-2xl p-4 text-center">
              <p className="font-mono text-2xl font-bold text-[#303030]">
                {percentage}%
              </p>
              <p className="text-[#898989] font-bold uppercase tracking-wider mt-1 text-[10px]">Score</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm rounded-2xl p-4 text-center">
              <p className="text-emerald-500 font-mono text-2xl font-bold">
                {timeUsed !== null
                  ? formatTime(timeUsed)
                  : `${attempted}/${questions.length}`}
              </p>
              <p className="text-[#898989] font-bold uppercase tracking-wider mt-1 text-[10px]">
                {timeUsed !== null ? "Time" : "Attempted"}
              </p>
            </div>
          </motion.div>

          {/* Question Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 space-y-3"
          >
            <h2 className="mb-4 text-lg font-bold text-[#303030]">Question Breakdown</h2>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correct;
              const isUnanswered = userAnswer === undefined;

              return (
                <div key={i} className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm overflow-hidden rounded-[1.5rem] p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isUnanswered ? "text-[#898989] bg-[#898989]/10" : isCorrect ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}
                    >
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm text-[#303030] font-medium">{q.question}</p>
                  </div>

                  {q.image && (
                    <img
                      src={q.image}
                      alt={`Question ${i + 1}`}
                      className="mb-3 max-h-48 w-full rounded-xl border border-[#898989]/10 bg-gray-50 object-contain p-2"
                    />
                  )}

                  <div className="mb-3 grid grid-cols-1 gap-2">
                    {q.options.map((opt, j) => {
                      let optClass = "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ";
                      let icon = null;
                      
                      if (j === q.correct) {
                        optClass += "bg-emerald-50 border-emerald-200 text-[#303030]";
                        icon = <CheckCircle size={16} className="shrink-0 text-emerald-500" />;
                      } else if (j === userAnswer && !isCorrect) {
                        optClass += "bg-red-50 border-red-200 text-[#303030]";
                        icon = <XCircle size={16} className="shrink-0 text-red-500" />;
                      } else {
                        optClass += "bg-white border-[#898989]/10 text-[#5E6470]";
                      }

                      return (
                        <div key={j} className={optClass}>
                          <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold ${j === q.correct ? 'bg-emerald-200 text-emerald-800' : (j === userAnswer && !isCorrect ? 'bg-red-200 text-red-800' : 'bg-[#898989]/10 text-[#898989]')}`}>
                            {OPTION_LABELS[j]}
                          </span>
                          <span className="flex-1 text-sm">{opt}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4">
                      <p className="text-blue-600 mb-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={14} /> Explanation
                      </p>
                      <p className="text-[#5E6470] text-sm leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              onClick={resetQuiz}
              className="bg-white border border-[#898989]/20 shadow-sm flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-[#303030] hover:bg-gray-50"
            >
              <RotateCcw size={16} /> Retry
            </button>
            <Link
              href={`/mcq/${subcategorySlug}`}
              className="bg-blue-600 shadow-sm text-white flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              All Tests <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════
  // QUIZ INTERFACE
  // ═══════════════════════════════════════════════════
  const q = questions[currentQ];
  if (!q) return null;

  const isRevisionAnswered = mode === "revision" && revisionRevealed;

  return (
    <main className="flex min-h-screen flex-col bg-[#f0f0f0]">

      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 border-b border-[#898989]/10 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={resetQuiz}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#898989]/10 transition-colors hover:bg-[#898989]/20 text-[#303030]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[#898989] font-medium truncate text-xs">{test.title}</p>
              <p className="text-xs font-bold text-[#303030]">
                Q {currentQ + 1}/{questions.length}
              </p>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold shadow-sm ${(mode === "exam" && globalTimer < 60) || (mode === "revision" && questionTimer <= 10) ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-white border-[#898989]/20 text-[#303030]"}`}
            >
              <Clock size={14} />
              <span className="font-mono">
                {mode === "exam"
                  ? formatTime(globalTimer)
                  : formatTime(questionTimer)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#898989]/10 mt-3 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-blue-600 h-full rounded-full"
              initial={false}
              animate={{
                width: `${((currentQ + 1) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Navigation Pills (Exam Mode Only) */}
        {mode === "exam" && (
          <div className="scrollbar-hide overflow-x-auto border-t border-[#898989]/10 bg-[#f9f9f9]">
            <div className="flex min-w-max gap-1.5 px-4 py-2">
              {questions.map((_, i) => {
                let pillClass = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all border ";
                if (i === currentQ) pillClass += "bg-blue-600 text-white border-blue-600 shadow-sm";
                else if (answers[i] !== undefined) pillClass += "bg-blue-50 text-blue-600 border-blue-200";
                else pillClass += "bg-white text-[#898989] border-[#898989]/20 hover:bg-gray-50";
                return (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={pillClass}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Question Body ─── */}
      <div className="container mx-auto max-w-2xl flex-1 px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question Text */}
            <div className="mb-6 bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 p-6 sm:p-8 rounded-[2rem]">
              <p className="text-lg leading-relaxed font-bold text-[#303030] sm:text-xl">
                {q.question}
              </p>
            </div>

            {/* Question Image */}
            {q.image && (
              <div className="mb-6">
                <img
                  src={q.image}
                  alt={`Question ${currentQ + 1}`}
                  className="max-h-60 w-full rounded-[1.5rem] border border-[#898989]/20 bg-white object-contain shadow-sm p-2"
                />
              </div>
            )}

            {/* Options */}
            <div className="mb-6 space-y-3">
              {q.options.map((opt, j) => {
                let optClass = "w-full text-left flex items-center gap-4 p-4 rounded-[1.25rem] border transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] ";
                let labelClass = "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold shrink-0 transition-all duration-300 ";
                const isSelected = answers[currentQ] === j;

                if (mode === "exam") {
                  if (isSelected) {
                    optClass += "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20";
                    labelClass += "bg-blue-600 text-white";
                  } else {
                    optClass += "bg-white border-[#898989]/20 hover:border-blue-300 hover:bg-gray-50 text-[#303030]";
                    labelClass += "bg-[#898989]/10 text-[#898989]";
                  }
                } else if (mode === "revision") {
                  if (revisionRevealed) {
                    if (j === q.correct) {
                      optClass += "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20";
                      labelClass += "bg-emerald-500 text-white";
                    }
                    else if (isSelected && j !== q.correct) {
                      optClass += "bg-red-50 border-red-300 ring-2 ring-red-500/20";
                      labelClass += "bg-red-500 text-white";
                    }
                    else {
                      optClass += "bg-white border-[#898989]/20 opacity-50";
                      labelClass += "bg-[#898989]/10 text-[#898989]";
                    }
                  } else {
                    if (isSelected) {
                      optClass += "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20";
                      labelClass += "bg-blue-600 text-white";
                    } else {
                      optClass += "bg-white border-[#898989]/20 hover:border-blue-300 hover:bg-gray-50 text-[#303030]";
                      labelClass += "bg-[#898989]/10 text-[#898989]";
                    }
                  }
                }

                return (
                  <motion.button
                    key={j}
                    whileTap={!isRevisionAnswered ? { scale: 0.98 } : {}}
                    onClick={() => !isRevisionAnswered && selectOption(j)}
                    disabled={isRevisionAnswered}
                    className={optClass}
                  >
                    <span className={labelClass}>{OPTION_LABELS[j]}</span>
                    <span className="flex-1 text-left text-sm font-medium sm:text-base text-[#303030]">
                      {opt}
                    </span>
                    {isRevisionAnswered && j === q.correct && (
                      <CheckCircle
                        size={20}
                        className="shrink-0 text-emerald-500"
                      />
                    )}
                    {isRevisionAnswered && isSelected && j !== q.correct && (
                      <XCircle size={20} className="shrink-0 text-red-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Revision: Show explanation after reveal */}
            {mode === "revision" && revisionRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                {timeExpired && answers[currentQ] === undefined && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
                    <AlertCircle
                      size={18}
                      className="shrink-0 text-amber-500"
                    />
                    <p className="text-sm font-medium text-amber-700">
                      Time&apos;s up! This question is marked as unanswered.
                    </p>
                  </div>
                )}

                {answers[currentQ] !== undefined && (
                  <div
                    className={`mb-3 flex items-center gap-2 rounded-xl px-4 py-3 border shadow-sm ${answers[currentQ] === q.correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
                  >
                    {answers[currentQ] === q.correct ? (
                      <>
                        <CheckCircle size={18} className="text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-700">
                          Correct! Well done.
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="text-red-500" />
                        <p className="text-sm font-medium text-red-700">
                          Incorrect. The right answer is{" "}
                          <strong className="font-bold">{OPTION_LABELS[q.correct]}</strong>.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {q.explanation && (
                  <div className="bg-white border border-[#898989]/20 shadow-sm p-5 rounded-[1.5rem]">
                    <p className="text-blue-600 mb-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} /> Explanation
                    </p>
                    <p className="text-[#5E6470] text-sm font-medium leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#898989]/10 bg-white/80 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          {mode === "exam" ? (
            <div className="flex gap-3">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="rounded-xl bg-white border border-[#898989]/20 text-[#303030] px-4 py-3 text-sm font-bold shadow-sm transition-opacity disabled:opacity-50 hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentQ === questions.length - 1}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#898989]/20 text-[#303030] py-3 text-sm font-bold shadow-sm transition-opacity disabled:opacity-50 hover:bg-gray-50"
              >
                Next <ChevronRight size={16} />
              </button>
              <button
                onClick={submitExam}
                className="bg-blue-600 shadow-md rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
              >
                Submit
              </button>
            </div>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!revisionRevealed}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all shadow-sm ${revisionRevealed ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]" : "cursor-not-allowed bg-gray-100 text-[#898989]"}`}
            >
              {currentQ === questions.length - 1 ? (
                <>
                  Finish & View Results <Trophy size={16} />
                </>
              ) : (
                <>
                  Next Question <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
