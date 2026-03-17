/**
 * ProjectCard — Displays a project with progress bar, team, and task count.
 */
import Link from "next/link";

export default function ProjectCard({ project }) {
  const progress = project.progress || 0;

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: project.color + "20", color: project.color }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500">{project.team}</p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`text-xs px-2 py-1 rounded-lg font-medium ${
              project.status === "active"
                ? "bg-emerald-500/15 text-emerald-400"
                : project.status === "completed"
                ? "bg-indigo-500/15 text-indigo-400"
                : "bg-amber-500/15 text-amber-400"
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{project.taskCount} tasks</span>
          <span>{project.dueDate}</span>
        </div>
      </div>
    </Link>
  );
}
