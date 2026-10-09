import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Loading from "../components/Loading";
import {
  FiArrowLeft,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiCpu,
  FiPrinter,
  FiRotateCcw,
  FiCheck,
} from "react-icons/fi";

export default function Report() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data } = await API.get(`/interview/${id}`);
      setInterview(data);
    } catch (err) {
      console.error("Failed to load report", err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loading text="Generating your comprehensive interview report..." />;
  if (!interview) return <div className="p-8 text-center text-slate-300">Interview report not found.</div>;

  const questions = interview.questions || [];
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => (q.score ?? 0) >= 7).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalScore = interview.totalScore ?? 0;

  let readinessBadge = {
    title: "Interview Ready",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    desc: "Candidate demonstrated strong domain mastery and accurate technical understanding.",
  };
  if (totalScore < 5) {
    readinessBadge = {
      title: "Core Concepts Review Needed",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      desc: "Recommend revisiting the foundational topics and reviewing incorrect options.",
    };
  } else if (totalScore < 7.5) {
    readinessBadge = {
      title: "Competent & Polishing",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      desc: "Good conceptual awareness. Fine-tuning edge cases will ensure top interview performance.",
    };
  }

  // Helper to clean option text
  const cleanOptionText = (optText) => {
    if (!optText) return "";
    return optText.replace(/^[A-Da-d][\)\.\:\-]\s*/, "").trim();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-800"
          >
            <FiPrinter className="w-4 h-4 text-indigo-400" />
            <span>Save / Print Report</span>
          </button>
        </div>

        {/* Executive Score Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden text-center sm:text-left">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                <FiAward className="w-3.5 h-3.5" />
                <span>Executive Assessment Summary</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {interview.role} Interview Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Difficulty: <span className="font-semibold text-slate-200">{interview.difficulty}</span> • Completed on{" "}
                {new Date(interview.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="pt-1">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${readinessBadge.color}`}>
                  {readinessBadge.title}
                </span>
                <p className="text-xs text-slate-400 mt-1 max-w-md">{readinessBadge.desc}</p>
              </div>
            </div>

            {/* Score Ring Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shrink-0 min-w-[180px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Overall Score
              </span>
              <div
                className={`text-5xl font-black ${
                  totalScore >= 7
                    ? "text-emerald-400"
                    : totalScore >= 4
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {totalScore}
                <span className="text-xl font-normal text-slate-500">/10</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-300">
                {accuracy}% Accuracy ({correctCount}/{totalQuestions} Correct)
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Questions</p>
              <p className="text-xl font-bold text-white mt-0.5">{totalQuestions}</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Correct Answers</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{correctCount}</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Missed / Review</p>
              <p className="text-xl font-bold text-rose-400 mt-0.5">{totalQuestions - correctCount}</p>
            </div>
          </div>
        </div>

        {/* AI Coach Comprehensive Feedback */}
        {interview.finalFeedback && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <FiCpu className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  AI Interview Coach Comprehensive Analysis
                </h2>
                <p className="text-xs text-slate-400">Key strengths & high-impact prep suggestions</p>
              </div>
            </div>

            <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {interview.finalFeedback}
            </div>
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-indigo-400" />
              Question-by-Question Performance Breakdown
            </h2>
            <span className="text-xs text-slate-400">
              {totalQuestions} Questions Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isCorrect = (q.score ?? 0) >= 7;
              const optionLetters = ["A", "B", "C", "D"];
              const userPick = (q.userSelectedOption || (q.answer ? q.answer.charAt(0) : "")).toUpperCase();
              const correctPick = (q.correctOption || "A").toUpperCase();

              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md uppercase">
                          Question {idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {isCorrect ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 pt-1">
                        {q.question}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-lg font-black ${
                          isCorrect ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {q.score ?? 0}/10
                      </span>
                    </div>
                  </div>

                  {/* 4 Options Display (if available) */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.slice(0, 4).map((opt, optIdx) => {
                        const letter = optionLetters[optIdx];
                        const text = cleanOptionText(opt);
                        const isThisCorrect = letter === correctPick;
                        const isThisUserPick = letter === userPick;

                        let optClasses = "bg-slate-900/50 border-slate-800 text-slate-400";
                        if (isThisCorrect) {
                          optClasses = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold";
                        } else if (isThisUserPick && !isThisCorrect) {
                          optClasses = "bg-rose-950/40 border-rose-500/60 text-rose-200 font-semibold";
                        }

                        return (
                          <div
                            key={letter}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${optClasses}`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isThisCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isThisUserPick
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {letter}
                              </span>
                              <span>{text}</span>
                            </div>

                            {isThisCorrect && (
                              <span className="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                                Correct ✓
                              </span>
                            )}
                            {isThisUserPick && !isThisCorrect && (
                              <span className="shrink-0 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                                Your Pick ✕
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* AI Feedback & Explanation */}
                  <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-1">
                    <p className="font-bold text-slate-200 flex items-center gap-1.5 text-xs text-indigo-400">
                      <FiCpu className="w-3.5 h-3.5" />
                      AI Coach Explanation:
                    </p>
                    <p className="leading-relaxed">{q.feedback || q.explanation || "No specific feedback."}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
          >
            ← Return to Dashboard
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span>Launch Another Mock Interview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}