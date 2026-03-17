/**
 * Team Store (Zustand)
 * Manages team state with mock data.
 */
import { create } from "zustand";

// --- Mock team data ---
const mockTeams = [
  {
    id: "team-1",
    name: "Frontend Squad",
    description: "Building beautiful user interfaces and seamless experiences",
    color: "#6366f1",
    members: [
      { id: "u1", name: "Alice", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice", role: "Lead" },
      { id: "u2", name: "Bob", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob", role: "Developer" },
      { id: "u3", name: "Charlie", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie", role: "Designer" },
    ],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "team-2",
    name: "Backend Ninjas",
    description: "Powering the platform with robust APIs and services",
    color: "#10b981",
    members: [
      { id: "u4", name: "Diana", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Diana", role: "Lead" },
      { id: "u5", name: "Eve", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Eve", role: "Developer" },
    ],
    createdAt: "2026-02-01T14:00:00Z",
  },
  {
    id: "team-3",
    name: "DevOps Crew",
    description: "Automating deployments and maintaining infrastructure",
    color: "#f59e0b",
    members: [
      { id: "u6", name: "Frank", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Frank", role: "Lead" },
      { id: "u7", name: "Grace", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Grace", role: "Engineer" },
      { id: "u8", name: "Hank", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Hank", role: "Engineer" },
      { id: "u9", name: "Ivy", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ivy", role: "Engineer" },
    ],
    createdAt: "2026-02-20T09:00:00Z",
  },
];

const useTeamStore = create((set) => ({
  // --- State ---
  teams: mockTeams,
  isLoading: false,

  /**
   * Add a new team
   */
  addTeam: (team) => {
    const newTeam = {
      id: "team-" + Date.now(),
      members: [],
      createdAt: new Date().toISOString(),
      ...team,
    };
    set((state) => ({ teams: [...state.teams, newTeam] }));
  },

  /**
   * Remove a team by ID
   */
  removeTeam: (teamId) => {
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    }));
  },

  /**
   * Update a team
   */
  updateTeam: (teamId, updates) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, ...updates } : t
      ),
    }));
  },
}));

export default useTeamStore;
