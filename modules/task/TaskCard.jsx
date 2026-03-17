/**
 * TaskCard — Individual task card used inside Kanban columns.
 * Shows title, priority badge, assignee, and description preview.
 */
"use client";

const priorityStyles = {
  high: "bg-rose-500/15 text-rose-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400",
};

export default function TaskCard({ task, onClick, dragListeners, dragAttributes, style, isDragging }) {
  return (
    <div
      className={`
        bg-[#12121a] rounded-xl border border-gray-700/30 p-4
        hover:border-indigo-500/30 transition-all duration-200
        cursor-grab active:cursor-grabbing group
        ${isDragging ? "opacity-50 shadow-2xl shadow-indigo-500/20 scale-105" : ""}
      `}
      onClick={onClick}
      style={style}
      {...dragListeners}
      {...dragAttributes}
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer: assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-700/20">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 shrink-0">
            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}
