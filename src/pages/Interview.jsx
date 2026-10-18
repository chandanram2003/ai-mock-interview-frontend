import { useEffect, useState, useRef, useCallback } from "react";
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
  FiMic,
  FiMicOff,
  FiClock,
  FiAward,
  FiCheck,
  FiCpu,
  FiHelpCircle,
  FiFileText,
  FiUser,
  FiRotateCcw,
  FiSend,
  FiGlobe,
} from "react-icons/fi";
import ThemeSelector from "../components/ThemeSelector";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Audio chime helper using Web Audio API
const playAudioChime = (type = "select") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "select") {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "start") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "stop") {
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Audio context may be restricted by browser policy
  }
};

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // AI Interviewer Hint State
  const [hint, setHint] = useState("");
  const [requestingHint, setRequestingHint] = useState(false);

  // Voice States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFeedbackSpeaking, setIsFeedbackSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceLang, setVoiceLang] = useState("en-IN"); // en-IN (Indian English/Hinglish) or en-US
  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem("ai_interview_autospeak") !== "false";
  });

  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Stale closure refs
  const selectedOptionRef = useRef(selectedOption);
  const userAnswerRef = useRef(userAnswer);
  const feedbackRef = useRef(feedback);
  const submittingRef = useRef(submitting);
  const currentRef = useRef(current);
  const interviewRef = useRef(interview);

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    userAnswerRef.current = userAnswer;
  }, [userAnswer]);

  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    interviewRef.current = interview;
  }, [interview]);

  // Clean option text (removes leading "A) " or "A. ")
  const cleanOptionText = (optText) => {
    if (!optText) return "";
    return optText.replace(/^[A-Da-d][\)\.\:\-]\s*/, "").trim();
  };

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
      loadQuestionState(data.questions[activeIdx], data);
    } catch (err) {
      console.error("Failed to load interview", err);
    }
    setLoading(false);
  };

  // Voice TTS helper: AI speaks the question
  const speakText = useCallback((text, onEnd) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices ? synthRef.current.getVoices() : [];
    const preferredVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Rishi") ||
            v.name.includes("Veena") ||
            v.name.includes("Daniel") ||
            v.name.includes("Jenny"))
      ) ||
      voices.find((v) => v.lang.startsWith("en-IN")) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsFeedbackSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsFeedbackSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const loadQuestionState = (q, currentInterviewObj = interview) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsFeedbackSpeaking(false);
    }
    if (isListeningRef.current) {
      stopListening();
    }
    setLiveTranscript("");
    setVoiceStatus("");
    setHint("");

    if (q && (q.answer || q.userSelectedOption)) {
      // Question already answered
      setSelectedOption(q.userSelectedOption || "");
      setUserAnswer(q.answer || "");
      setFeedback({
        score: q.score,
        feedback: q.feedback,
        correctOption: q.correctOption,
        explanation: q.explanation,
        isCorrect: (q.score ?? 0) >= 6,
      });
    } else {
      setSelectedOption("");
      setUserAnswer("");
      setFeedback(null);

      // Auto-speak question when loaded - ONLY for open-ended conversational mock interview (NOT for MCQ test)
      const isCurrentOpenEnded =
        !q?.options || q?.options.length === 0 || currentInterviewObj?.mode === "open-ended";
      if (isCurrentOpenEnded && autoSpeak && q?.question) {
        setTimeout(() => {
          setIsSpeaking(true);
          speakText(q.question, () => setIsSpeaking(false));
        }, 500);
      }
    }
  };

  const handleSelectQuestion = (index) => {
    if (!interview || !interview.questions[index]) return;
    setCurrent(index);
    loadQuestionState(interview.questions[index]);
  };

  // Keyboard shortcut listener for MCQ options (A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeInterview = interviewRef.current;
      const activeCurrent = currentRef.current;
      const activeQ = activeInterview?.questions?.[activeCurrent];
      const isQOpenEnded = !activeQ?.options || activeQ?.options.length === 0 || activeInterview?.mode === "open-ended";

      if (isQOpenEnded || feedback || submitting) return;

      const key = e.key.toUpperCase();
      if (key === "1" || key === "A") {
        setSelectedOption("A");
        playAudioChime("select");
      }
      if (key === "2" || key === "B") {
        setSelectedOption("B");
        playAudioChime("select");
      }
      if (key === "3" || key === "C") {
        setSelectedOption("C");
        playAudioChime("select");
      }
      if (key === "4" || key === "D") {
        setSelectedOption("D");
        playAudioChime("select");
      }

      if (e.key === "Enter" && selectedOption && !submitting) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, feedback, submitting]);

  // Clean-up speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Text to speech toggles
  const toggleQuestionSpeech = (text) => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
      return;
    }
    if (isFeedbackSpeaking) {
      synthRef.current?.cancel();
      setIsFeedbackSpeaking(false);
    }
    setIsSpeaking(true);
    speakText(text, () => setIsSpeaking(false));
  };

  const toggleFeedbackSpeech = (text) => {
    if (isFeedbackSpeaking) {
      synthRef.current?.cancel();
      setIsFeedbackSpeaking(false);
      return;
    }
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    }
    setIsFeedbackSpeaking(true);
    speakText(text, () => setIsFeedbackSpeaking(false));
  };

  const handleToggleAutoSpeak = () => {
    const newVal = !autoSpeak;
    setAutoSpeak(newVal);
    localStorage.setItem("ai_interview_autospeak", String(newVal));
  };

  // Format elapsed time MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Request Hint from AI Interviewer
  const handleRequestHint = async () => {
    if (requestingHint || hint) return;
    setRequestingHint(true);
    try {
      const { data } = await API.post(`/interview/${id}/ask-ai`, {
        questionIndex: current,
      });
      setHint(data.hint);
    } catch (err) {
      setHint("💡 Interviewer Hint: Think about how you would structure this in a production project—consider real-world trade-offs, architecture, and step-by-step problem solving.");
    }
    setRequestingHint(false);
  };

  // Start speech recognition (ONLY for open-ended conversational mock interview)
  const startListening = () => {
    const activeInterview = interviewRef.current;
    const activeCurrent = currentRef.current;
    const activeQ = activeInterview?.questions?.[activeCurrent] || {};
    const isQOpenEnded = !activeQ.options || activeQ.options.length === 0 || activeInterview?.mode === "open-ended";

    // In MCQ test mode, microphone is completely disabled
    if (!isQOpenEnded) return;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, Safari, or Brave for full voice support.");
      return;
    }

    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang; // en-IN for Indian English / Hinglish or en-US

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setVoiceStatus("Listening live... Speak clearly into your microphone 🎙️");
        playAudioChime("start");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const spoken = (final || interim).trim();
        if (spoken) {
          setLiveTranscript(spoken);

          if (final) {
            setUserAnswer((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${final.trim()}` : final.trim();
            });
            setVoiceStatus("Voice captured ✨ Keep speaking or click 'Stop' when finished.");
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser to speak your answers.");
          stopListening();
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceStatus("");
    setLiveTranscript("");
    playAudioChime("stop");
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Re-record (clears existing spoken response and starts listening)
  const handleReRecord = () => {
    setUserAnswer("");
    setLiveTranscript("");
    startListening();
  };

  // Submit Answer
  const handleSubmit = async () => {
    const activeInterview = interviewRef.current || interview;
    const activeCurrent = currentRef.current;
    const activeQ = activeInterview.questions[activeCurrent] || {};
    const isQOpenEnded = !activeQ.options || activeQ.options.length === 0 || activeInterview.mode === "open-ended";

    const currentOpt = selectedOptionRef.current;
    const currentText = userAnswerRef.current.trim();

    if (isQOpenEnded) {
      if (!currentText) {
        alert("Please tap the microphone button and speak your answer before submitting.");
        return;
      }
    } else {
      if (!currentOpt && !currentText) {
        alert("Please select one of the 4 options (A, B, C, or D).");
        return;
      }
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsFeedbackSpeaking(false);
    }
    if (isListeningRef.current) {
      stopListening();
    }

    setSubmitting(true);
    try {
      let payloadAnswer = currentText;
      if (!isQOpenEnded && currentOpt) {
        const optionLetters = ["A", "B", "C", "D"];
        const optIndex = optionLetters.indexOf(currentOpt);
        const chosenText = activeQ.options && activeQ.options[optIndex] ? activeQ.options[optIndex] : currentOpt;
        payloadAnswer = currentText ? `${chosenText} | Notes: ${currentText}` : chosenText;
      }

      const { data } = await API.post(`/interview/${id}/answer`, {
        questionIndex: activeCurrent,
        selectedOption: isQOpenEnded ? "" : currentOpt,
        answer: payloadAnswer,
      });

      setFeedback(data);
      playAudioChime(data.score >= 6 ? "select" : "stop");

      // Update question in local state
      const updatedQuestions = [...activeInterview.questions];
      updatedQuestions[activeCurrent] = {
        ...updatedQuestions[activeCurrent],
        userSelectedOption: isQOpenEnded ? "" : currentOpt,
        answer: payloadAnswer,
        score: data.score,
        feedback: data.feedback,
        correctOption: data.correctOption,
        explanation: data.explanation,
      };
      setInterview({ ...activeInterview, questions: updatedQuestions });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit answer");
    }
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setIsFeedbackSpeaking(false);
    if (isListeningRef.current) stopListening();

    const activeInterview = interviewRef.current || interview;
    const activeCurrent = currentRef.current;

    if (activeCurrent + 1 < activeInterview.questions.length) {
      const nextIdx = activeCurrent + 1;
      setCurrent(nextIdx);
      loadQuestionState(activeInterview.questions[nextIdx], activeInterview);
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

  // Check if open-ended interview mode
  const isOpenEnded = !q.options || q.options.length === 0 || interview.mode === "open-ended";

  // MCQ display options fallback if needed
  const optionLetters = ["A", "B", "C", "D"];
  const displayOptions =
    q.options && q.options.length >= 4
      ? q.options.slice(0, 4)
      : [
          "A) Standard implementation approach",
          "B) Optimized architectural pattern",
          "C) Alternative asynchronous method",
          "D) Default fallback configuration",
        ];

  const isCurrentAnswered = !!(q.answer || q.userSelectedOption || feedback);
  const answeredCount = interview.questions.filter((item) => item.answer || item.userSelectedOption).length;
  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back link & Role */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Exit
            </Link>
            <ThemeSelector compact />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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
                {interview.isResumeBased && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-sm">
                    <FiFileText className="w-2.5 h-2.5" /> Resume Tailored
                  </span>
                )}
                {isOpenEnded ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                    🎙️ Spoken Interview
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    📝 Practice Test (Options Only)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Controls & Timer (Voice buttons only for Spoken Interview) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isOpenEnded && (
              <>
                {/* Voice Accent Toggle */}
                <button
                  onClick={() => setVoiceLang((prev) => (prev === "en-IN" ? "en-US" : "en-IN"))}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
                  title="Toggle speech recognition language model"
                >
                  <FiGlobe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{voiceLang === "en-IN" ? "🇮🇳 English (India)" : "🌐 English (US)"}</span>
                </button>

                {/* Auto-Voice Interviewer Toggle */}
                <button
                  onClick={handleToggleAutoSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    autoSpeak
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-glow-indigo"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300"
                  }`}
                  title="Automatically read questions aloud when loaded"
                >
                  <FiVolume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Voice:</span>
                  <span className={autoSpeak ? "text-indigo-300 font-bold" : "text-slate-500"}>
                    {autoSpeak ? "ON" : "OFF"}
                  </span>
                </button>
              </>
            )}

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <FiClock className="w-3.5 h-3.5 text-indigo-400" />
              {formatTimer(secondsElapsed)}
            </div>

            {/* Question Counter */}
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

        {/* Resume Extracted Skills Strip */}
        {interview.isResumeBased && interview.extractedSkills && interview.extractedSkills.length > 0 && (
          <div className="max-w-5xl mx-auto mt-2.5 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400 pb-0.5 scrollbar-none">
            <span className="text-purple-400 font-semibold shrink-0 flex items-center gap-1">
              <FiFileText className="w-3 h-3" /> Resume Topics:
            </span>
            {interview.extractedSkills.map((sk, skIdx) => (
              <span
                key={skIdx}
                className="bg-purple-950/40 text-purple-200 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0"
              >
                {sk}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
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

          {/* AI Recruiter Question Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
                    AI Hiring Manager
                  </span>
                  <p className="text-xs text-slate-400">Question {current + 1} of {totalQuestions}</p>
                </div>
              </div>

              {/* Action Controls: Voice button ONLY for spoken interview */}
              <div className="flex items-center gap-2">
                {isOpenEnded && (
                  <button
                    onClick={() => toggleQuestionSpeech(q.question)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      isSpeaking
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300"
                    }`}
                    title="Listen to AI interviewer speak this question"
                  >
                    {isSpeaking ? <FiVolumeX className="w-3.5 h-3.5" /> : <FiVolume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? "Stop Voice" : "Hear Question"}</span>
                  </button>
                )}

                {!feedback && !hint && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={requestingHint}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/40 transition-all"
                  >
                    <FiHelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{requestingHint ? "Thinking..." : "Interviewer Hint"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 leading-relaxed tracking-tight">
              {q.question}
            </h1>
          </div>

          {/* Interviewer Hint Banner (if requested) */}
          {hint && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <FiHelpCircle className="w-4 h-4" /> Interviewer Hint
                </span>
                <button
                  type="button"
                  onClick={() => setHint("")}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300">{hint}</p>
            </div>
          )}

          {/* PURE VOICE MOCK INTERVIEW STUDIO (100% Voice / Spoken Answers - NO TYPING) */}
          {isOpenEnded ? (
            <div className="space-y-5">
              {!feedback ? (
                /* Unanswered State: Voice Cockpit */
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-center relative overflow-hidden">
                  {/* Visualizer Ambient Aura */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                  {/* Top Status */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Candidate Voice Station
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {isListening
                        ? "🎙️ Microphone is Live — Speak Your Answer"
                        : userAnswer
                        ? "✅ Voice Response Recorded"
                        : "Ready to answer? Tap the microphone to speak."}
                    </h2>
                  </div>

                  {/* Big Voice Button & Animated Wave */}
                  <div className="flex flex-col items-center justify-center py-2 space-y-4">
                    {/* Pulsing Audio Waves when Recording */}
                    {isListening && (
                      <div className="flex items-center gap-1.5 h-10 py-1">
                        <span className="w-1.5 bg-sky-400 rounded-full animate-bounce h-8" />
                        <span className="w-1.5 bg-indigo-400 rounded-full animate-bounce h-5 delay-75" />
                        <span className="w-1.5 bg-purple-400 rounded-full animate-bounce h-9 delay-150" />
                        <span className="w-1.5 bg-pink-400 rounded-full animate-bounce h-6 delay-200" />
                        <span className="w-1.5 bg-rose-400 rounded-full animate-bounce h-10 delay-300" />
                        <span className="w-1.5 bg-purple-400 rounded-full animate-bounce h-7 delay-150" />
                        <span className="w-1.5 bg-sky-400 rounded-full animate-bounce h-4" />
                      </div>
                    )}

                    {/* Microphone Action Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`relative group p-6 rounded-full border transition-all duration-300 transform active:scale-95 shadow-2xl flex items-center justify-center ${
                        isListening
                          ? "bg-gradient-to-r from-rose-600 to-red-600 border-rose-400 text-white shadow-glow-rose scale-110 animate-pulse"
                          : userAnswer
                          ? "bg-slate-900 border-emerald-500/50 text-emerald-400 hover:border-emerald-400"
                          : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-400 text-white shadow-glow-indigo hover:scale-105"
                      }`}
                      title={isListening ? "Click to stop recording" : "Click to speak your answer"}
                    >
                      {isListening ? (
                        <FiMicOff className="w-10 h-10" />
                      ) : (
                        <FiMic className="w-10 h-10" />
                      )}
                    </button>

                    <p className="text-xs font-semibold text-slate-300">
                      {isListening ? (
                        <span className="text-rose-400">Click to finish speaking</span>
                      ) : userAnswer ? (
                        <span className="text-emerald-400">Answer captured! Click below to submit or speak again.</span>
                      ) : (
                        <span className="text-slate-400">Click microphone to speak your answer</span>
                      )}
                    </p>
                  </div>

                  {/* Real-time Streaming Transcript Box while Speaking */}
                  {isListening && liveTranscript && (
                    <div className="bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 text-left animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        Live Transcribing:
                      </div>
                      <p className="text-sm text-sky-200 italic leading-relaxed">
                        "{liveTranscript}"
                      </p>
                    </div>
                  )}

                  {/* Spoken Answer Display Card (Recorded) */}
                  {userAnswer && (
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 text-left space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5 text-indigo-400">
                          <FiUser className="w-4 h-4" /> Your Spoken Answer:
                        </span>
                        <span className="font-mono text-slate-400">
                          {wordCount} words spoken
                        </span>
                      </div>

                      <p className="text-sm sm:text-base text-slate-100 leading-relaxed italic bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                        "{userAnswer}"
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                        <button
                          type="button"
                          onClick={handleReRecord}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <FiRotateCcw className="w-3.5 h-3.5" />
                          <span>Speak Again (Re-record)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>AI Evaluating Spoken Answer...</span>
                            </>
                          ) : (
                            <>
                              <FiSend className="w-4 h-4" />
                              <span>Submit Spoken Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Helper footer */}
                  <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-2">
                    <span>💡 Tip: Speak clearly like in a real HR/Tech interview. You can answer in English or Hinglish!</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* MCQ Quiz Fallback Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FiHelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Select One Option (Press A, B, C, D)
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
                          playAudioChime("select");
                        }
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group relative ${stateClasses}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition-all ${badgeClasses}`}
                      >
                        {letter}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <p className="text-sm sm:text-base font-medium leading-relaxed">
                          {textContent}
                        </p>
                      </div>

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
          )}

          {/* AI Feedback & Score Card (Visible After Submission) */}
          {feedback && (
            <div className="space-y-4 animate-fadeIn">
              {/* Score Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                  feedback.score >= 6
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      feedback.score >= 6
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {feedback.score >= 6 ? (
                      <FiCheckCircle className="w-6 h-6" />
                    ) : (
                      <FiXCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                      {feedback.score >= 8
                        ? "🎉 Exceptional Answer!"
                        : feedback.score >= 6
                        ? "👍 Strong Spoken Response!"
                        : "⚠️ Needs Deeper Concepts"}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {feedback.score >= 6
                        ? "Well articulated! You addressed the core principles with good technical clarity."
                        : "Good attempt! Review the interviewer breakdown below to refine your spoken response."}
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
                        feedback.score >= 6 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {feedback.score}/10
                    </p>
                  </div>
                </div>
              </div>

              {/* Candidate's Spoken Response Review */}
              {userAnswer && (
                <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FiUser className="w-3.5 h-3.5 text-sky-400" /> Your Spoken Answer:
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {userAnswer.split(/\s+/).length} words
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    "{userAnswer}"
                  </p>
                </div>
              )}

              {/* AI Coach Detailed Feedback Card */}
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <FiCpu className="w-4 h-4" />
                    <h3 className="font-bold text-sm tracking-wide uppercase">
                      Interviewer Evaluation & Model Concepts
                    </h3>
                  </div>

                  {/* Feedback Voice Listen Button (ONLY in spoken interview) */}
                  {isOpenEnded && (
                    <button
                      onClick={() => toggleFeedbackSpeech(feedback.feedback)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        isFeedbackSpeaking
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse"
                          : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300"
                      }`}
                      title="Listen to interviewer feedback out loud"
                    >
                      {isFeedbackSpeaking ? <FiVolumeX className="w-3.5 h-3.5" /> : <FiVolume2 className="w-3.5 h-3.5" />}
                      <span>{isFeedbackSpeaking ? "Stop Voice" : "Hear Feedback"}</span>
                    </button>
                  )}
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
            <span>Progress:</span>
            <span className="font-bold text-slate-200">
              {answeredCount} of {totalQuestions} Questions Completed
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {feedback ? (
              <button
                onClick={nextQuestion}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <span>
                  {current + 1 < totalQuestions ? "Next Question" : "Finish & View Performance Report"}
                </span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              !isOpenEnded && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedOption}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Option</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
