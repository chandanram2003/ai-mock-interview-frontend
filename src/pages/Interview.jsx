import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Loading from "../components/Loading";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
  FiVolume2,
  FiVolumeX,
  FiClock,
  FiAward,
  FiCheck,
  FiCpu,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [optionalNotes, setOptionalNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const synthRef = useRef(window.speechSynthesis);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch interview
  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const { data } = await API.get(`/interview/${id}`);
      setInterview(data);
      // Find first unanswered question
      const idx = data.questions.findIndex((q) => !q.answer && !q.userSelectedOption);
      const activeIdx = idx === -1 ? 0 : idx;
      setCurrent(activeIdx);
      loadQuestionState(data.questions[activeIdx]);
    } catch (err) {
      console.error("Failed to load interview", err);
    }
    setLoading(false);
  };

  const loadQuestionState = (q) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    if (q && (q.answer || q.userSelectedOption)) {
      // Question already answered
      setSelectedOption(q.userSelectedOption || (q.answer ? q.answer.charAt(0) : ""));
      setOptionalNotes(q.answer || "");
      setFeedback({
        score: q.score,
        feedback: q.feedback,
        correctOption: q.correctOption,
        explanation: q.explanation,
        isCorrect: q.score >= 7,
      });
    } else {
      setSelectedOption("");
      setOptionalNotes("");
      setFeedback(null);
    }
  };

  const handleSelectQuestion = (index) => {
    if (!interview || !interview.questions[index]) return;
    setCurrent(index);
    loadQuestionState(interview.questions[index]);
  };

  // Keyboard shortcut listener for options (1, 2, 3, 4 or A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (feedback || submitting) return;
      // Don't trigger if user is typing in textarea
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

      const key = e.key.toUpperCase();
      if (key === "1" || key === "A") setSelectedOption("A");
      if (key === "2" || key === "B") setSelectedOption("B");
      if (key === "3" || key === "C") setSelectedOption("C");
      if (key === "4" || key === "D") setSelectedOption("D");

      if (e.key === "Enter" && selectedOption && !submitting) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, feedback, submitting]);

  // Text to speech
  const toggleSpeech = (text) => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // Format elapsed time MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean option text (removes leading "A) " or "A. ")
  const cleanOptionText = (optText) => {
    if (!optText) return "";
    return optText.replace(/^[A-Da-d][\)\.\:\-]\s*/, "").trim();
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert("Please select one of the 4 options (A, B, C, or D).");
      return;
    }

    setSubmitting(true);
    try {
      const q = interview.questions[current];
      // Extract option text if available
      const optionLetters = ["A", "B", "C", "D"];
      const optIndex = optionLetters.indexOf(selectedOption);
      const chosenText = q.options && q.options[optIndex] ? q.options[optIndex] : selectedOption;

      const payloadAnswer = optionalNotes.trim()
        ? `${chosenText} | Notes: ${optionalNotes.trim()}`
        : chosenText;

      const { data } = await API.post(`/interview/${id}/answer`, {
        questionIndex: current,
        selectedOption,
        answer: payloadAnswer,
      });

      setFeedback(data);

      // Update question in local state
      const updatedQuestions = [...interview.questions];
      updatedQuestions[current] = {
        ...updatedQuestions[current],
        userSelectedOption: selectedOption,
        answer: payloadAnswer,
        score: data.score,
        feedback: data.feedback,
        correctOption: data.correctOption,
        explanation: data.explanation,
      };
      setInterview({ ...interview, questions: updatedQuestions });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit answer");
    }
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);

    if (current + 1 < interview.questions.length) {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      loadQuestionState(interview.questions[nextIdx]);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    try {
      await API.post(`/interview/${id}/finish`);
      navigate(`/report/${id}`);
    } catch (err) {
      alert("Failed to finish interview");
    }
  };

  if (loading) return <Loading text="Preparing your mock interview cockpit..." />;
  if (!interview) return <div className="p-8 text-center text-slate-300">Interview session not found.</div>;

  const q = interview.questions[current] || {};
  const totalQuestions = interview.questions.length;
  const progressPercent = Math.round(((current + 1) / totalQuestions) * 100);

  // Clean options array fallback
  const optionLetters = ["A", "B", "C", "D"];
  const displayOptions =
    q.options && q.options.length >= 4
      ? q.options.slice(0, 4)
      : [
          "A) Comprehensive standard implementation",
          "B) Optimized architectural pattern",
          "C) Alternative asynchronous approach",
          "D) Fallback default configuration",
        ];

  const isCurrentAnswered = !!(q.answer || q.userSelectedOption || feedback);
  const answeredCount = interview.questions.filter((item) => item.answer || item.userSelectedOption).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back link & Role */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Exit
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm sm:text-base">
                  {interview.role}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    interview.difficulty === "Easy"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : interview.difficulty === "Hard"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {interview.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Timer & Question Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <FiClock className="w-3.5 h-3.5 text-indigo-400" />
              {formatTimer(secondsElapsed)}
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <span>Q {current + 1}</span>
              <span className="text-slate-400">/</span>
              <span>{totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-5xl mx-auto mt-3">
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out shadow-glow-indigo"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Nav Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {interview.questions.map((questionItem, idx) => {
              const isAnswered = !!(questionItem.answer || questionItem.userSelectedOption);
              const isCurrent = idx === current;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`min-w-[34px] h-[34px] rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-glow-indigo scale-105"
                      : isAnswered
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                  title={`Go to Question ${idx + 1}`}
                >
                  {isAnswered ? <FiCheck className="w-3.5 h-3.5" /> : idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Display Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-xl border border-slate-800">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                  Question {current + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-400">Multiple Choice</span>
              </div>

              {/* Speech Read Button */}
              <button
                onClick={() => toggleSpeech(q.question)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  isSpeaking
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300"
                }`}
                title="Read question out loud"
              >
                {isSpeaking ? <FiVolumeX className="w-3.5 h-3.5" /> : <FiVolume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop Voice" : "Listen Voice"}</span>
              </button>
            </div>

            {/* Question Text */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 leading-relaxed tracking-tight">
              {q.question}
            </h1>
          </div>

          {/* The 4 Options (A, B, C, D) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiHelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Select One Option (Press A, B, C, D or 1, 2, 3, 4)
              </p>
              {selectedOption && !feedback && (
                <span className="text-xs font-medium text-indigo-400">
                  Option {selectedOption} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {displayOptions.map((optionItem, optIdx) => {
                const letter = optionLetters[optIdx];
                const textContent = cleanOptionText(optionItem);
                const isSelected = selectedOption === letter;

                // State after evaluation
                let stateClasses = "bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60";
                let badgeClasses = "bg-slate-800 text-slate-300 border-slate-700";

                if (feedback) {
                  const targetCorrect = feedback.correctOption || q.correctOption || "A";
                  const isThisCorrect = letter === targetCorrect;
                  const isThisSelected = letter === selectedOption;

                  if (isThisCorrect) {
                    stateClasses = "bg-emerald-950/40 border-emerald-500/80 text-emerald-100 shadow-glow-emerald";
                    badgeClasses = "bg-emerald-600 text-white border-emerald-400";
                  } else if (isThisSelected && !isThisCorrect) {
                    stateClasses = "bg-rose-950/40 border-rose-500/80 text-rose-100 shadow-glow-rose";
                    badgeClasses = "bg-rose-600 text-white border-rose-400";
                  } else {
                    stateClasses = "bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60";
                    badgeClasses = "bg-slate-800 text-slate-500 border-slate-800";
                  }
                } else if (isSelected) {
                  stateClasses = "bg-indigo-950/40 border-indigo-500 text-white shadow-glow-indigo ring-1 ring-indigo-500";
                  badgeClasses = "bg-indigo-600 text-white border-indigo-400";
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={isCurrentAnswered && !feedback}
                    onClick={() => {
                      if (!feedback) {
                        setSelectedOption(letter);
                      }
                    }}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group relative ${stateClasses}`}
                  >
                    {/* Letter badge (A, B, C, D) */}
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition-all ${badgeClasses}`}
                    >
                      {letter}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm sm:text-base font-medium leading-relaxed">
                        {textContent}
                      </p>
                    </div>

                    {/* Keyboard shortcut hint or Status indicator */}
                    <div className="shrink-0 pt-0.5">
                      {feedback ? (
                        letter === (feedback.correctOption || q.correctOption || "A") ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-md">
                            <FiCheck className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : letter === selectedOption ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-md">
                            <FiXCircle className="w-3.5 h-3.5" /> Your Pick
                          </span>
                        ) : null
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 group-hover:text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                            Key {letter}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-indigo-400 bg-indigo-500 text-white"
                                : "border-slate-700 group-hover:border-slate-500"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes Section */}
          {!feedback && (
            <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>📝 Add personal notes or explanation (Optional)</span>
                {showNotes ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>

              {showNotes && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                  <textarea
                    placeholder="Type why you selected this option (optional, AI coach will review your reasoning)..."
                    className="w-full glass-input text-slate-200 text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-20 placeholder:text-slate-500"
                    value={optionalNotes}
                    onChange={(e) => setOptionalNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Feedback & Score Banner (Visible After Submission) */}
          {feedback && (
            <div className="space-y-4 animate-fadeIn">
              {/* Score Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                  feedback.score >= 7
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      feedback.score >= 7
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {feedback.score >= 7 ? (
                      <FiCheckCircle className="w-6 h-6" />
                    ) : (
                      <FiXCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                      {feedback.score >= 7 ? "🎉 Correct Answer!" : "❌ Incorrect Choice"}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {feedback.score >= 7
                        ? "Excellent knowledge! You secured full points for this question."
                        : `The correct answer was Option ${feedback.correctOption || q.correctOption || "A"}.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Question Score
                    </p>
                    <p
                      className={`text-2xl font-black ${
                        feedback.score >= 7 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {feedback.score}/10
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Coach Detailed Explanation */}
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FiCpu className="w-4 h-4" />
                  <h3 className="font-bold text-sm tracking-wide uppercase">
                    AI Coach Breakdown & Concept Insight
                  </h3>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-sans">
                  {feedback.feedback}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Completed:</span>
            <span className="font-bold text-slate-200">
              {answeredCount} of {totalQuestions} Questions
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!feedback ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedOption}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Option</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <span>
                  {current + 1 < totalQuestions ? "Next Question" : "Finish & View Report"}
                </span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
