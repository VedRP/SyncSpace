/**
 * Button — Reusable button component with multiple variants.
 * Supports: primary, secondary, danger, ghost, outline styles.
 */
"use client";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  ...props
}) {
  // Base styles shared across all variants
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Variant-specific styles
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25",
    secondary:
      "bg-[#1a1a2e] text-gray-200 border border-gray-700 hover:bg-[#222240] hover:border-indigo-500/30 focus:ring-gray-500",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 focus:ring-rose-500 shadow-lg shadow-rose-500/25",
    ghost:
      "bg-transparent text-gray-300 hover:bg-white/5 hover:text-white focus:ring-gray-500",
    outline:
      "bg-transparent text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 focus:ring-indigo-500",
  };

  // Size variants
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
