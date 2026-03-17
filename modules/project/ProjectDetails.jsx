/**
 * ProjectDetails — Full project detail view with stats, members, and recent tasks.
 */
"use client";

import Link from "next/link";
import Button from "@/components/Button";

// Mock details data (in real app, fetched by project ID)
const projectData = {
  "proj-1": {
    id: "proj-1",
    name: "SyncSpace Platform",
    description: "Build the real-time collaborative work platform with dashboards, tasks, and team management.",
    team: "Frontend Squad",
    color: "#6366f1",
    status: "active",
    progress: 65,
    createdAt: "Jan 15, 2026",
    dueDate: "Apr 15, 2026",
    members: [
      { name: "Alice", role: "Lead", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice" },
      { name: "Bob", role: "Developer", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob" },
      { name: "Charlie", role: "Designer", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie" },
    ],
    stats: { total: 24, done: 16, inProgress: 5, todo: 3 },
  },
  "proj-2": {
    id: "proj-2",
    name: "Mobile App",
    description: "Native mobile app for iOS and Android with push notifications and offline support.",
    team: "Backend Ninjas",
    color: "#10b981",
    status: "active",
    progress: 30,
    createdAt: "Feb 01, 2026",
    dueDate: "May 20, 2026",
    members: [
      { name: "Diana", role: "Lead", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Diana" },
      { name: "Eve", role: "Developer", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Eve" },
    ],
    stats: { total: 18, done: 5, inProgress: 6, todo: 7 },
  },
};

export default function ProjectDetails({ projectId }) {
  const project = projectData[projectId] || projectData["proj-1"];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/project" className="hover:text-indigo-400 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-gray-300">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: project.color + "20", color: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
        </div>
        <Link href={`/task/${project.id}`}>
          <Button variant="primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Tasks
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: project.stats.total, color: "text-indigo-400" },
          { label: "Completed", value: project.stats.done, color: "text-emerald-400" },
          { label: "In Progress", value: project.stats.inProgress, color: "text-amber-400" },
          { label: "To Do", value: project.stats.todo, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a2e] rounded-xl border border-gray-700/30 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Overall Progress</h3>
          <span className="text-sm font-bold text-indigo-400">{project.progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-5">
        <h3 className="text-base font-semibold text-white mb-4">Team Members</h3>
        <div className="space-y-3">
          {project.members.map((member) => (
            <div key={member.name} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 shrink-0">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
