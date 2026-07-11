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
    if (mode !== "revision" || !started || showResult || revisionRevealed) return;
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
    [questions.length]
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
    [mode, currentQ, revisionRevealed]
  );

  const goToQuestion = useCallback(
    (index) => {
      if (mode === "exam") {
        setCurrentQ(index);
      }
    },
    [mode]
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
    0
  );
  const attempted = Object.keys(answers).length;

  // ─── Loading / Not Found ────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <AlertCircle size={48} className="text-muted mb-4" />
        <h1 className="text-xl font-bold mb-2">Test Not Found</h1>
        <Link href={`/mcq/${subcategorySlug}`} className="text-primary text-sm">
          ← Back to Tests
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-muted" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">{test.title}</h1>
        <p className="text-muted mb-6 max-w-xs">
          Questions for this test are coming soon. Check back later!
        </p>
        <Link
          href={`/mcq/${subcategorySlug}`}
          className="inline-flex items-center gap-2 btn-outline px-6 py-3 rounded-xl text-sm font-semibold"
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
      <main className="min-h-screen pb-20">
        <div className="halo-bg" />
        <div className="grid-bg" />

        <div className="container mx-auto px-4 pt-16 max-w-lg">
          <Link
            href={`/mcq/${subcategorySlug}`}
            className="inline-flex items-center gap-2 text-muted text-sm mb-6 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold font-display mb-1">
              {test.title}
            </h1>
            <p className="text-muted text-sm">
              {questions.length} questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {/* Exam Mode Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => startQuiz("exam")}
              className="w-full text-left panel rounded-3xl p-6 relative overflow-hidden transition-all active:scale-[0.98] hover:border-primary/30"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl bg-primary/10" />
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shrink-0">
                  <Timer size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Exam Mode</h2>
                  <p className="text-xs text-muted">Simulate real exam conditions</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted relative z-10">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span>Timer: {questions.length} min for {questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-primary shrink-0" />
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
              className="w-full text-left panel rounded-3xl p-6 relative overflow-hidden transition-all active:scale-[0.98] hover:border-secondary/30"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl bg-secondary/10" />
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Revision Mode</h2>
                  <p className="text-xs text-muted">Learn at your own pace</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted relative z-10">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-secondary shrink-0" />
                  <span>1 minute per question</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-secondary shrink-0" />
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
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const timeUsed = mode === "exam" ? questions.length * 60 - globalTimer : null;

    return (
      <main className="min-h-screen pb-20">
        <div className="halo-bg" />
        <div className="grid-bg" />

        <div className="container mx-auto px-4 pt-12 max-w-2xl">
          {/* Score Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <Trophy size={40} className={percentage >= 60 ? "text-primary" : "text-muted"} />
            </div>
            <h1 className="text-3xl font-bold font-display mb-1">
              {percentage >= 80 ? "Excellent! 🎉" : percentage >= 60 ? "Good Job! 👏" : percentage >= 40 ? "Keep Trying! 💪" : "Don't Give Up! 📚"}
            </h1>
            <p className="text-muted">{test.title} — {mode === "exam" ? "Exam" : "Revision"} Mode</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold text-primary font-mono">{score}/{questions.length}</p>
              <p className="text-xs text-muted mt-1">Correct</p>
            </div>
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold text-white font-mono">{percentage}%</p>
              <p className="text-xs text-muted mt-1">Score</p>
            </div>
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold text-secondary font-mono">
                {timeUsed !== null ? formatTime(timeUsed) : `${attempted}/${questions.length}`}
              </p>
              <p className="text-xs text-muted mt-1">{timeUsed !== null ? "Time" : "Attempted"}</p>
            </div>
          </motion.div>

          {/* Question Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-8"
          >
            <h2 className="text-lg font-bold mb-4">Question Breakdown</h2>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correct;
              const isUnanswered = userAnswer === undefined;

              return (
                <div key={i} className="panel rounded-2xl p-4 overflow-hidden">
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isUnanswered ? "bg-white/10 text-muted" : isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-white flex-1">{q.question}</p>
                  </div>

                  {q.image && (
                    <img src={q.image} alt={`Question ${i + 1}`} className="w-full max-h-48 object-contain rounded-xl bg-black/30 mb-3" />
                  )}

                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {q.options.map((opt, j) => {
                      let optClass = "mcq-option-result";
                      if (j === q.correct) optClass += " mcq-option-correct";
                      else if (j === userAnswer && !isCorrect) optClass += " mcq-option-wrong";

                      return (
                        <div key={j} className={optClass}>
                          <span className="mcq-option-label">{OPTION_LABELS[j]}</span>
                          <span className="flex-1 text-sm">{opt}</span>
                          {j === q.correct && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                          {j === userAnswer && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mcq-explanation">
                      <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
                      <p className="text-sm text-muted leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button onClick={resetQuiz} className="flex-1 btn-outline flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold">
              <RotateCcw size={16} /> Retry
            </button>
            <Link href={`/mcq/${subcategorySlug}`} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm">
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
    <main className="min-h-screen flex flex-col">
      <div className="halo-bg" />
      <div className="grid-bg" />

      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={resetQuiz}
              className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted truncate">{test.title}</p>
              <p className="text-xs font-semibold">Q {currentQ + 1}/{questions.length}</p>
            </div>

            {/* Timer */}
            <div className={`mcq-timer-pill ${(mode === "exam" && globalTimer < 60) || (mode === "revision" && questionTimer <= 10) ? "mcq-timer-danger" : ""}`}>
              <Clock size={14} />
              <span className="font-mono font-bold text-sm">
                {mode === "exam" ? formatTime(globalTimer) : formatTime(questionTimer)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 progress-track h-1">
            <motion.div
              className="progress-fill h-full"
              initial={false}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Navigation Pills (Exam Mode Only) */}
        {mode === "exam" && (
          <div className="border-t border-white/5 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 px-4 py-2 min-w-max">
              {questions.map((_, i) => {
                let pillClass = "mcq-nav-pill";
                if (i === currentQ) pillClass += " mcq-nav-active";
                else if (answers[i] !== undefined) pillClass += " mcq-nav-answered";
                return (
                  <button key={i} onClick={() => goToQuestion(i)} className={pillClass}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Question Body ─── */}
      <div className="flex-1 container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question Text */}
            <div className="mb-6">
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium">{q.question}</p>
            </div>

            {/* Question Image */}
            {q.image && (
              <div className="mb-6">
                <img src={q.image} alt={`Question ${currentQ + 1}`} className="w-full max-h-60 object-contain rounded-2xl bg-black/30 border border-white/5" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {q.options.map((opt, j) => {
                let optClass = "mcq-option";
                const isSelected = answers[currentQ] === j;

                if (mode === "exam") {
                  if (isSelected) optClass += " mcq-option-selected";
                } else if (mode === "revision") {
                  if (revisionRevealed) {
                    if (j === q.correct) optClass += " mcq-option-correct";
                    else if (isSelected && j !== q.correct) optClass += " mcq-option-wrong";
                    else optClass += " mcq-option-disabled";
                  } else {
                    if (isSelected) optClass += " mcq-option-selected";
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
                    <span className="mcq-option-label">{OPTION_LABELS[j]}</span>
                    <span className="flex-1 text-left text-sm sm:text-base">{opt}</span>
                    {isRevisionAnswered && j === q.correct && <CheckCircle size={18} className="text-emerald-400 shrink-0" />}
                    {isRevisionAnswered && isSelected && j !== q.correct && <XCircle size={18} className="text-red-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Revision: Show explanation after reveal */}
            {mode === "revision" && revisionRevealed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                {timeExpired && answers[currentQ] === undefined && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-3">
                    <AlertCircle size={16} className="text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-300">Time&apos;s up! This question is marked as unanswered.</p>
                  </div>
                )}

                {answers[currentQ] !== undefined && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-3 ${answers[currentQ] === q.correct ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                    {answers[currentQ] === q.correct ? (
                      <>
                        <CheckCircle size={16} className="text-emerald-400" />
                        <p className="text-sm text-emerald-300">Correct! Well done.</p>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <p className="text-sm text-red-300">Incorrect. The right answer is <strong>{OPTION_LABELS[q.correct]}</strong>.</p>
                      </>
                    )}
                  </div>
                )}

                {q.explanation && (
                  <div className="mcq-explanation">
                    <p className="text-xs font-semibold text-primary mb-1.5">💡 Explanation</p>
                    <p className="text-sm text-muted leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          {mode === "exam" ? (
            <div className="flex gap-3">
              <button onClick={prevQuestion} disabled={currentQ === 0} className="px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold disabled:opacity-30 transition-opacity">
                Prev
              </button>
              <button onClick={nextQuestion} disabled={currentQ === questions.length - 1} className="flex-1 py-3 rounded-xl bg-white/5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity">
                Next <ChevronRight size={16} />
              </button>
              <button onClick={submitExam} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-black text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary/25">
                Submit
              </button>
            </div>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!revisionRevealed}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${revisionRevealed ? "bg-gradient-to-r from-primary to-secondary text-white" : "bg-white/10 text-gray-400 cursor-not-allowed"}`}
            >
              {currentQ === questions.length - 1 ? (
                <>Finish & View Results <Trophy size={16} /></>
              ) : (
                <>Next Question <ChevronRight size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
