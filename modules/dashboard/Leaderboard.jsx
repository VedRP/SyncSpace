/**
 * Leaderboard — Displays top contributors by tasks completed.
 */
const leaderboardData = [
  { rank: 1, name: "Alice", tasks: 34, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice" },
  { rank: 2, name: "Bob", tasks: 28, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob" },
  { rank: 3, name: "Charlie", tasks: 22, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie" },
  { rank: 4, name: "Diana", tasks: 19, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Diana" },
  { rank: 5, name: "Eve", tasks: 15, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Eve" },
];

const rankColors = {
  1: "text-amber-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export default function Leaderboard() {
  return (
    <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>

      <div className="space-y-3">
        {leaderboardData.map((user) => (
          <div
            key={user.rank}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            {/* Rank */}
            <span
              className={`w-7 text-sm font-bold text-center ${rankColors[user.rank] || "text-gray-500"}`}
            >
              #{user.rank}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 shrink-0">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>

            {/* Name */}
            <span className="flex-1 text-sm font-medium text-gray-200">{user.name}</span>

            {/* Tasks count */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-indigo-400">{user.tasks}</span>
              <span className="text-xs text-gray-600">tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
