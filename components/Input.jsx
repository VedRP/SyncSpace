/**
 * Input — Reusable form input with label, error state, and icons.
 */
"use client";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  className = "",
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-[#12121a] border text-gray-100 text-sm
            placeholder:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? "pl-10" : ""}
            ${error ? "border-rose-500/50 focus:ring-rose-500/40" : "border-gray-700/50 hover:border-gray-600"}
          `}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
