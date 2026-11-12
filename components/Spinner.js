"use client";

export default function Spinner({ size = "md", text = "", className = "" }) {
  const sizeClasses = {
    xs: "w-3.5 h-3.5 border-2",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2.5",
    lg: "w-10 h-10 border-3",
    xl: "w-14 h-14 border-4",
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-indigo-400/30 animate-ping absolute opacity-60`}
        />
        {/* Gradient spinning ring */}
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-t-amber-500 border-r-indigo-600 border-b-emerald-500 border-l-transparent animate-spin`}
        />
      </div>
      {text && (
        <span className="text-xs font-medium text-gray-500 tracking-wide animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

export function LoadingOverlay({ text = "Communicating with secure data vault..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm mx-4 text-center">
        <Spinner size="xl" />
        <h4 className="text-sm font-bold text-gray-900 mt-4 mb-1">Processing Request</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

