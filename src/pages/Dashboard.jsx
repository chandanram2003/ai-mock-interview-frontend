import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import {
  FiZap,
  FiPlay,
  FiAward,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiTrash2,
  FiArrowRight,
  FiLayers,
  FiCode,
  FiServer,
  FiUsers,
  FiCpu,
  FiMic,
  FiHelpCircle,
} from "react-icons/fi";

const ROLE_OPTIONS = [
  {
    name: "Frontend Developer",
    icon: FiCode,
    description: "React, JavaScript, CSS Grid, DOM & Web Performance",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
  },
  {
    name: "Backend Developer",
    icon: FiServer,
    description: "Node.js, APIs, Express, MongoDB, SQL & Security",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
  {
    name: "Full Stack Developer",
    icon: FiLayers,
    description: "End-to-End System Design, React + Node + DB",
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
  },
  {
    name: "HR Interview",
    icon: FiUsers,
    description: "Behavioral, STAR Method, Team Conflict & Career Goals",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    name: "DSA",
    icon: FiCpu,
    description: "Data Structures, Algorithms, Time & Space Complexity",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [role, setRole] = useState(ROLE_OPTIONS[0].name);
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [mode, setMode] = useState("hybrid");
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data } = await API.get("/interview/all");
      setInterviews(data);
    } catch (err) {
      console.error("Failed to load interview history", err);
    }
    setLoading(false);
  };

  const startInterview = async () => {
    const finalRole = customRole.trim() ? customRole.trim() : role;
    if (!finalRole) {
      alert("Please select or enter a target role.");
      return;
    }

    setStarting(true);
    try {
      const { data } = await API.post("/interview/start", {
        role: finalRole,
        difficulty,
        questionCount,
        mode,
      });
      navigate(`/interview/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start interview");
      setStarting(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;

    try {
      await API.delete(`/interview/${id}`);
      setInterviews(interviews.filter((i) => i._id !== id));
    } catch (err) {
      alert("Failed to delete interview");
    }
  };

  // Metrics
  const completedList = interviews.filter((i) => i.status === "completed");
  const totalCompleted = completedList.length;
  const avgScore =
    totalCompleted > 0
      ? (
          completedList.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) /
          totalCompleted
        ).toFixed(1)
      : 0;
  const bestScore =
    totalCompleted > 0
      ? Math.max(...completedList.map((i) => i.totalScore || 0))
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <FiZap className="w-3.5 h-3.5" />
              <span>Next-Gen 4-Option Technical & HR Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Level Up Your Interview Skills with <span className="gradient-text">Instant AI Coaching</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Experience realistic mock interviews featuring structured 4-option multiple-choice challenges, instant evaluation, sound narration, and detailed feedback reports.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-8 pt-8 border-t border-slate-800/80">
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Interviews Taken</span>
              </div>
              <p className="text-2xl font-black text-white">{totalCompleted}</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <FiTrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Average Score</span>
              </div>
              <p className="text-2xl font-black text-white">
                {avgScore}
                <span className="text-sm font-normal text-slate-400"> / 10</span>
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <FiAward className="w-4 h-4 text-amber-400" />
                <span>Best Performance</span>
              </div>
              <p className="text-2xl font-black text-white">
                {bestScore}
                <span className="text-sm font-normal text-slate-400"> / 10</span>
              </p>
            </div>
          </div>
        </section>

        {/* Start Interview Cockpit */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiPlay className="w-5 h-5 text-indigo-400" />
                Launch New AI Mock Interview
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose your desired role, difficulty, and question length to generate customized 4-option questions.
              </p>
            </div>
          </div>

          {/* 1. Role Selection Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 1: Select Target Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ROLE_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.name && !customRole;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setRole(item.name);
                      setCustomRole("");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 group relative ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 shadow-glow-indigo ring-1 ring-indigo-500"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-glow-indigo" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="pt-2">
              <input
                type="text"
                placeholder="Or type a custom role (e.g., DevOps Engineer, React Native Developer, Python Lead)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full glass-input text-xs sm:text-sm p-3 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 2. Difficulty & Question Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Difficulty */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Easy", desc: "Foundational", color: "hover:border-emerald-500/50" },
                  { name: "Medium", desc: "Core Standard", color: "hover:border-amber-500/50" },
                  { name: "Hard", desc: "Advanced Nuances", color: "hover:border-rose-500/50" },
                ].map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setDifficulty(d.name)}
                    className={`py-3 px-2 rounded-xl text-center border text-xs font-bold transition-all ${
                      difficulty === d.name
                        ? d.name === "Easy"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-glow-emerald"
                          : d.name === "Hard"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500 shadow-glow-rose"
                          : "bg-amber-500/20 text-amber-300 border-amber-500"
                        : `bg-slate-900/60 text-slate-400 border-slate-800 ${d.color}`
                    }`}
                  >
                    <div>{d.name}</div>
                    <div className="text-[10px] font-normal opacity-70 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 3: Question Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 5, label: "5 Questions", time: "~5 Mins" },
                  { count: 10, label: "10 Questions", time: "~12 Mins" },
                  { count: 15, label: "15 Questions", time: "~20 Mins" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setQuestionCount(item.count)}
                    className={`py-3 px-2 rounded-xl text-center border text-xs font-bold transition-all ${
                      questionCount === item.count
                        ? "bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-glow-indigo"
                        : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal opacity-70 mt-0.5">{item.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start CTA Button */}
          <div className="pt-2">
            <button
              onClick={startInterview}
              disabled={starting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI generating questions with 4 options...</span>
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5" />
                  <span>Start Mock Interview ({customRole || role} • {difficulty} • {questionCount} Qs)</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Past Interviews List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-indigo-400" />
              Interview History & Assessment Records
            </h2>
            <span className="text-xs text-slate-400">
              {interviews.length} {interviews.length === 1 ? "Session" : "Sessions"}
            </span>
          </div>

          {loading ? (
            <Loading text="Loading your history..." />
          ) : interviews.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <FiZap className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-white">No mock interviews yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Choose a role from the cockpit above and begin your first 4-option mock interview!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map((i) => {
                const isCompleted = i.status === "completed";
                const targetUrl = isCompleted ? `/report/${i._id}` : `/interview/${i._id}`;
                return (
                  <div
                    key={i._id}
                    className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                            {i.role}
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                              i.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : i.difficulty === "Hard"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {i.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span>{new Date(i.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}</span>
                          {i.totalQuestions ? (
                            <span>• {i.answeredQuestions || 0}/{i.totalQuestions} Questions</span>
                          ) : null}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        {isCompleted ? (
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-xl font-black ${
                                i.totalScore >= 7
                                  ? "text-emerald-400"
                                  : i.totalScore >= 4
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {i.totalScore}
                              <span className="text-xs font-normal text-slate-400">/10</span>
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                              Completed
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <button
                        onClick={(e) => handleDelete(e, i._id)}
                        title="Delete Record"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>

                      <Link
                        to={targetUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl hover:bg-indigo-500/20"
                      >
                        <span>{isCompleted ? "View Report" : "Resume Interview"}</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
