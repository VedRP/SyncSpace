/**
 * NotificationList — List of mock notifications inside the dropdown.
 */
const mockNotifications = [
  {
    id: 1,
    type: "task",
    message: `Alice moved "Design landing page" to Done`,
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "team",
    message: "You were added to Frontend Squad",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "comment",
    message: `Bob commented on "Implement auth flow"`,
    time: "3 hours ago",
    unread: true,
  },
  {
    id: 4,
    type: "project",
    message: `New project "Mobile App" created`,
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    type: "task",
    message: "Charlie assigned you a task",
    time: "2 days ago",
    unread: false,
  },
];

/* Icon per notification type */
const typeIcons = {
  task: (
    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </div>
  ),
  team: (
    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  ),
  comment: (
    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    </div>
  ),
  project: (
    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </div>
  ),
};

export default function NotificationList() {
  return (
    <div className="max-h-80 overflow-y-auto">
      {mockNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            flex items-start gap-3 px-4 py-3 cursor-pointer
            hover:bg-white/5 transition-colors border-b border-gray-700/20 last:border-b-0
            ${notif.unread ? "bg-indigo-500/5" : ""}
          `}
        >
          {typeIcons[notif.type]}
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${notif.unread ? "text-gray-200" : "text-gray-400"}`}>
              {notif.message}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{notif.time}</p>
          </div>
          {notif.unread && (
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
