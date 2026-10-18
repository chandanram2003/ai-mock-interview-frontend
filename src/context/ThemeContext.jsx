import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEMES = [
  {
    id: "cosmic",
    name: "Cosmic Midnight",
    desc: "Deep Obsidian & Indigo Aurora",
    color: "#6366f1",
    dotBg: "bg-indigo-500",
  },
  {
    id: "sapphire",
    name: "Deep Sapphire",
    desc: "Midnight Navy & Ocean Blue",
    color: "#0ea5e9",
    dotBg: "bg-sky-500",
  },
  {
    id: "violet",
    name: "Cyber Amethyst",
    desc: "Deep Purple & Neon Amethyst",
    color: "#a855f7",
    dotBg: "bg-purple-500",
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    desc: "Deep Charcoal & Mint Teal",
    color: "#10b981",
    dotBg: "bg-emerald-500",
  },
  {
    id: "noir",
    name: "Obsidian Noir",
    desc: "Pure Minimalist Carbon Pitch",
    color: "#f8fafc",
    dotBg: "bg-slate-300",
  },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("interview_theme") || "cosmic";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("interview_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "cosmic",
      setTheme: () => {},
      themes: THEMES,
    };
  }
  return context;
};
