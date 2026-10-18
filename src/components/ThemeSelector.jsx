import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FiCheck } from "react-icons/fi";

export default function ThemeSelector({ compact = false }) {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800/90 text-xs font-semibold text-slate-200 transition-all shadow-sm hover:border-white/20 active:scale-95"
        title="Change App Background Theme"
      >
        <span className="text-sm">🎨</span>
        <span
          className="w-2.5 h-2.5 rounded-full shadow-sm"
          style={{ backgroundColor: currentThemeObj.color }}
        />
        {!compact && (
          <span className="hidden sm:inline text-slate-300 font-medium">
            {currentThemeObj.name.split(" ")[0]}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl p-1.5 shadow-2xl glass-panel border border-white/15 z-50 animate-fadeIn backdrop-blur-2xl">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Background Theme
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Live Preview</span>
          </div>

          <div className="py-1 space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? "bg-white/10 text-white font-bold border border-white/15 shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{t.name}</div>
                      <div className="text-[10px] text-slate-400 truncate opacity-80">
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <FiCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
