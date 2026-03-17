/**
 * Loader — Animated loading spinner with optional text.
 */
export default function Loader({ text = "Loading...", size = "md" }) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      {/* Spinner ring */}
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-2 border-gray-700`}
        />
        <div
          className={`absolute top-0 left-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-indigo-500 animate-spin`}
        />
      </div>
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
}
