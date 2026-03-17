/**
 * StatsCard — Dashboard stat card with icon, value, label, and trend.
 */
export default function StatsCard({ icon, label, value, trend, color = "indigo" }) {
  const colors = {
    indigo: { bg: "bg-indigo-500/15", text: "text-indigo-400", glow: "shadow-indigo-500/10" },
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", glow: "shadow-emerald-500/10" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-400", glow: "shadow-amber-500/10" },
    cyan: { bg: "bg-cyan-500/15", text: "text-cyan-400", glow: "shadow-cyan-500/10" },
    rose: { bg: "bg-rose-500/15", text: "text-rose-400", glow: "shadow-rose-500/10" },
  };

  const c = colors[color] || colors.indigo;

  return (
    <div className={`bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-5 hover:border-gray-600/50 transition-all duration-300 shadow-lg ${c.glow}`}>
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={`
              text-xs font-semibold px-2 py-1 rounded-lg
              ${trend > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}
            `}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
