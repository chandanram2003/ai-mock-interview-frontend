import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiZap, FiGrid, FiUser, FiHome } from "react-icons/fi";
import ThemeSelector from "./ThemeSelector";

export default function Navbar() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
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
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Mock Interview Studio</p>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <FiHome className="w-3.5 h-3.5 text-slate-400" />
            Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <FiGrid className="w-3.5 h-3.5 text-indigo-400" />
            Dashboard
          </Link>
        </div>

        {/* User profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSelector />

          <div className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left mr-2">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.name || "Candidate"}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Mock Candidate</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}