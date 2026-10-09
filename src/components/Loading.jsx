import { FiZap } from "react-icons/fi";

export default function Loading({ text = "Loading intelligent interview..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiZap className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-300 animate-pulse tracking-wide">
        {text}
      </p>
    </div>
  );
}