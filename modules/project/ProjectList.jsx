/**
 * ProjectList — Renders a grid of ProjectCards with mock data.
 */
"use client";

import ProjectCard from "./ProjectCard";

// Mock project data
const mockProjects = [
  {
    id: "proj-1",
    name: "SyncSpace Platform",
    description: "Build the real-time collaborative work platform with dashboards, tasks, and team management.",
    team: "Frontend Squad",
    color: "#6366f1",
    status: "active",
    progress: 65,
    taskCount: 24,
    dueDate: "Apr 15, 2026",
  },
  {
    id: "proj-2",
    name: "Mobile App",
    description: "Native mobile app for iOS and Android with push notifications and offline support.",
    team: "Backend Ninjas",
    color: "#10b981",
    status: "active",
    progress: 30,
    taskCount: 18,
    dueDate: "May 20, 2026",
  },
  {
    id: "proj-3",
    name: "API Gateway",
    description: "Centralized API gateway with rate limiting, authentication, and request routing.",
    team: "DevOps Crew",
    color: "#f59e0b",
    status: "planning",
    progress: 10,
    taskCount: 8,
    dueDate: "Jun 01, 2026",
  },
  {
    id: "proj-4",
    name: "Design System",
    description: "Unified component library and design tokens for consistent UI across all products.",
    team: "Frontend Squad",
    color: "#8b5cf6",
    status: "completed",
    progress: 100,
    taskCount: 32,
    dueDate: "Mar 01, 2026",
  },
];

export default function ProjectList() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all your projects</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
