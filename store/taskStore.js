/**
 * Task Store (Zustand)
 * Manages task state for the Kanban board.
 * Tasks have statuses: "todo", "in-progress", "done".
 */
import { create } from "zustand";

// --- Mock task data ---
const mockTasks = [
  {
    id: "task-1",
    title: "Design landing page",
    description: "Create wireframes and final design for the landing page",
    status: "done",
    priority: "high",
    assignee: { name: "Alice", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice" },
    projectId: "proj-1",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Implement auth flow",
    description: "Build login and signup pages with form validation",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Bob", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob" },
    projectId: "proj-1",
    createdAt: "2026-03-11T09:00:00Z",
  },
  {
    id: "task-3",
    title: "Setup database schema",
    description: "Define MongoDB collections for users, teams, and projects",
    status: "todo",
    priority: "medium",
    assignee: { name: "Charlie", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie" },
    projectId: "proj-1",
    createdAt: "2026-03-12T14:00:00Z",
  },
  {
    id: "task-4",
    title: "Build dashboard analytics",
    description: "Create charts and stats for project overview",
    status: "todo",
    priority: "low",
    assignee: { name: "Diana", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Diana" },
    projectId: "proj-2",
    createdAt: "2026-03-13T08:00:00Z",
  },
  {
    id: "task-5",
    title: "Create API endpoints",
    description: "Build REST API routes for teams and projects",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Eve", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Eve" },
    projectId: "proj-2",
    createdAt: "2026-03-14T11:00:00Z",
  },
  {
    id: "task-6",
    title: "Write unit tests",
    description: "Add tests for auth, team, and project modules",
    status: "todo",
    priority: "medium",
    assignee: { name: "Alice", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice" },
    projectId: "proj-1",
    createdAt: "2026-03-15T16:00:00Z",
  },
  {
    id: "task-7",
    title: "Deploy to staging",
    description: "Set up CI/CD pipeline and deploy to staging environment",
    status: "todo",
    priority: "low",
    assignee: { name: "Bob", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob" },
    projectId: "proj-2",
    createdAt: "2026-03-16T07:00:00Z",
  },
  {
    id: "task-8",
    title: "Design chat UI",
    description: "Build the real-time chat interface with message bubbles",
    status: "done",
    priority: "medium",
    assignee: { name: "Charlie", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie" },
    projectId: "proj-1",
    createdAt: "2026-03-09T12:00:00Z",
  },
];

const useTaskStore = create((set, get) => ({
  // --- State ---
  tasks: mockTasks,
  isLoading: false,

  /**
   * Get tasks filtered by project ID
   */
  getTasksByProject: (projectId) => {
    return get().tasks.filter((t) => t.projectId === projectId);
  },

  /**
   * Get tasks filtered by status
   */
  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  /**
   * Add a new task
   */
  addTask: (task) => {
    const newTask = {
      id: "task-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...task,
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  /**
   * Move a task to a different status column (for Kanban drag & drop)
   */
  moveTask: (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));
  },

  /**
   * Update a task's properties
   */
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    }));
  },

  /**
   * Delete a task by ID
   */
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },
}));

export default useTaskStore;
