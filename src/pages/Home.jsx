import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiZap,
  FiArrowRight,
  FiCheckCircle,
  FiAward,
  FiBarChart2,
  FiCode,
  FiMic,
  FiHelpCircle,
  FiGrid,
  FiCpu,
  FiShield,
  FiCheck,
  FiChevronRight,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: <FiCpu className="w-6 h-6 text-indigo-400" />,
      title: "Adaptive AI Questioning",
      description:
        "Dynamic questions tuned precisely to your selected role, tech stack, and experience level just like top tech hiring bars.",
    },
    {
      icon: <FiHelpCircle className="w-6 h-6 text-purple-400" />,
      title: "Smart 4-Option Assistance",
      description:
        "Stuck during the interview? Toggle the 4-Option helper to see AI-crafted hints and structured answer avenues.",
    },
    {
      icon: <FiMic className="w-6 h-6 text-sky-400" />,
      title: "Voice & Speech Recognition",
      description:
        "Practice speaking out loud naturally with built-in browser speech recognition to simulate high-pressure live video rounds.",
    },
    {
      icon: <FiBarChart2 className="w-6 h-6 text-emerald-400" />,
      title: "In-Depth Scoring & Feedback",
      description:
        "Get instant scoring out of 100 with category-wise breakdown on technical depth, clarity, and areas for improvement.",
    },
    {
      icon: <FiCode className="w-6 h-6 text-amber-400" />,
      title: "Multi-Stack Support",
      description:
        "From Frontend (React, Vue) to Backend (Node, Python, Go) and System Design, test your skills across any domain.",
    },
    {
      icon: <FiShield className="w-6 h-6 text-rose-400" />,
      title: "Zero-Risk Practice Sandbox",
      description:
        "Unlimited practice rounds in a judgment-free space so you can overcome interview anxiety before the real deal.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Configure Your Session",
      desc: "Pick your target job role (Frontend, Backend, Fullstack, AI), select your core technologies, and set your experience level.",
    },
    {
      step: "02",
      title: "Take The AI Mock Round",
      desc: "Answer sequential technical questions via text or voice. Leverage the 4-Option mode whenever you need conceptual direction.",
    },
    {
      step: "03",
      title: "Review Analytics & Improve",
      desc: "Receive an immediate scorecard with ideal model answers, actionable feedback, and score analysis to level up fast.",
    },
  ];

  const domains = [
    "React.js & Next.js",
    "Node.js & Express",
    "Python & FastAPI",
    "Java & Spring Boot",
    "Full Stack Web",
    "System Design & Scalability",
    "PostgreSQL & MongoDB",
    "Data Structures & Algorithms",
    "DevOps & Docker",
    "AI & Prompt Engineering",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -left-40 w-[450px] h-[350px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[350px] bg-blue-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Interview<span className="text-indigo-400">IQ</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI 4-Option
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Mock Interview Studio
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#domains" className="hover:text-white transition-colors">
              Tech Stacks
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <FiGrid className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
                >
                  Get Started Free
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium mb-8 animate-pulse-subtle">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <FiStar className="w-3.5 h-3.5 text-indigo-400" />
            Next-Gen AI Mock Interview Studio • 100% Free Practice
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            Master Your Next Tech Interview With{" "}
            <span className="gradient-text">Real-Time AI Guidance</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Practice realistic, role-tailored technical rounds with instant AI evaluations,
            speech recognition, 4-option conceptual assistance, and detailed scoring reports.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.03]"
            >
              Start Free Mock Interview
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 font-semibold text-base transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-14 pt-8 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Realistic Scenarios</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">4-Option</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">AI Guided Mode</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">Instant</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Score & Analysis</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Speech</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Voice Recognition</div>
            </div>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl glass-panel p-2 sm:p-4 border border-slate-800 shadow-2xl relative">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-5 sm:p-8 text-left">
              {/* Fake Interview Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    Live Session: Full Stack React & Node.js • Junior/Mid
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI Interviewer Active
                  </span>
                </div>
              </div>

              {/* Sample AI Question */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <FiAward className="w-4 h-4" /> Question 2 of 5
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-2 leading-relaxed">
                  "Explain how React’s reconciliation algorithm (Fiber) handles updates between the
                  Virtual DOM and the real DOM, and why keys are crucial in lists?"
                </h3>
              </div>

              {/* Sample 4-Option Mode Preview */}
              <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <FiHelpCircle className="w-3.5 h-3.5" /> AI 4-Option Conceptual Assistance Mode
                  </span>
                  <span className="text-[11px] text-slate-400">Hint Activated</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-xs text-indigo-100 flex items-start gap-2">
                    <span className="font-bold text-indigo-400">A.</span>
                    <span>Fiber enables incremental rendering and diffs nodes by element type and unique keys.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                    <span className="font-bold text-slate-500">B.</span>
                    <span>Virtual DOM directly reloads the entire HTML page without diffing.</span>
                  </div>
                </div>
              </div>

              {/* Sample AI Evaluation Score */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <FiTrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>AI Score: <strong className="text-emerald-400 text-sm">94/100</strong> (Excellent Technical Accuracy)</span>
                </div>
                <span className="text-indigo-400 font-medium">
                  Detailed breakdown generated automatically →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              How InterviewIQ Works
            </p>
            <p className="mt-4 text-slate-400 text-base">
              No complicated setups. Choose your target tech stack, practice live with AI feedback, and review your performance report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl glass-card p-7 border border-slate-800/80 hover:border-indigo-500/30 transition-all group"
              >
                <div className="text-4xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors mb-4">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Features Grid */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Built For Serious Developers
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything You Need to Crack Tech Rounds
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Engineered to replicate actual interview conditions with cutting-edge AI scoring and guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl glass-card p-6 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Tech Stacks & Domains */}
        <section id="domains" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Role & Technology Coverage
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready for Any Tech Stack You Target
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Practice interviews for the modern software industry's most in-demand languages, frameworks, and architectures.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {domains.map((dom, i) => (
              <span
                key={i}
                className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-sm font-medium text-slate-300 hover:text-white transition-all shadow-sm"
              >
                ⚡ {dom}
              </span>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-900">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Common Questions
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-400" />
                Is InterviewIQ free to use?
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Yes! You can create an account and practice mock interviews across all supported roles and stacks without any payment.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-400" />
                What is the "4-Option Assisted Mode"?
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                If you get stuck on a tough open-ended question, our AI can generate 4 conceptual multiple-choice hints to give you direction while maintaining active recall.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-400" />
                Can I answer using my microphone?
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Yes! InterviewIQ includes native speech recognition so you can speak your answers aloud just like in a real Google Meet or Zoom interview.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-400" />
                How are the scores and feedback calculated?
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Our AI model evaluates your responses against industry benchmarks for technical accuracy, solution depth, clarity, and best practices, providing a comprehensive report for each answer.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to Ace Your Next Tech Interview?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300">
                Start practicing with realistic AI mock sessions today. Sharpen your skills, gain confidence, and land your offer letter.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-base hover:bg-slate-200 transition-all hover:scale-105 shadow-xl"
                >
                  {user ? "Go to Dashboard" : "Get Started Now — It's Free"}
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-4 rounded-xl glass-card text-white font-semibold text-base hover:bg-slate-800 border border-slate-700 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-4 sm:px-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <FiZap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">InterviewIQ</span>
            <span>— Intelligent Mock Interview Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">
              How It Works
            </a>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">
              Sign Up
            </Link>
          </div>
          <p>© {new Date().getFullYear()} InterviewIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
