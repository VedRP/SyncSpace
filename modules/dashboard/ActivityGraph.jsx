/**
 * ActivityGraph — Mock CSS bar chart for dashboard analytics.
 * Displays weekly activity data with animated bars.
 */
"use client";

const weeklyData = [
  { day: "Mon", tasks: 12, height: 60 },
  { day: "Tue", tasks: 18, height: 90 },
  { day: "Wed", tasks: 8, height: 40 },
  { day: "Thu", tasks: 22, height: 100 },
  { day: "Fri", tasks: 15, height: 75 },
  { day: "Sat", tasks: 6, height: 30 },
  { day: "Sun", tasks: 10, height: 50 },
];

export default function ActivityGraph() {
  return (
    <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
          <p className="text-sm text-gray-500">Tasks completed this week</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold gradient-text">91</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-3 h-40">
        {weeklyData.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            {/* Value label */}
            <span className="text-xs text-gray-500">{item.tasks}</span>

            {/* Bar */}
            <div className="w-full relative">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-700 ease-out"
                style={{
                  height: `${item.height}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </div>

            {/* Day label */}
            <span className="text-xs text-gray-500 font-medium">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
