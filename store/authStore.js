/**
 * Auth Store (Zustand)
 * Manages user authentication state with localStorage persistence.
 * Provides login, signup, logout, and loadUser actions.
 */
import { create } from "zustand";

const useAuthStore = create((set) => ({
  // --- State ---
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Simulate login with email/password.
   * Stores mock user in localStorage on success.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const user = {
            id: "user_1",
            name: email.split("@")[0],
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
            role: "Admin",
            joinedAt: new Date().toISOString(),
          };

          // Persist to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("syncspace_user", JSON.stringify(user));
          }

          set({ user, isAuthenticated: true, isLoading: false, error: null });
          resolve(user);
        } else {
          const error = "Invalid email or password (min 6 chars)";
          set({ isLoading: false, error });
          reject(new Error(error));
        }
      }, 1200);
    });
  },

  /**
   * Simulate sign-up with name, email, password.
   */
  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password.length >= 6) {
          const user = {
            id: "user_" + Date.now(),
            name,
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
            role: "Member",
            joinedAt: new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("syncspace_user", JSON.stringify(user));
          }

          set({ user, isAuthenticated: true, isLoading: false, error: null });
          resolve(user);
        } else {
          const error = "All fields required. Password must be at least 6 characters.";
          set({ isLoading: false, error });
          reject(new Error(error));
        }
      }, 1200);
    });
  },

  /**
   * Log out the current user and clear localStorage.
   */
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("syncspace_user");
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  /**
   * Load user from localStorage on app mount.
   */
  loadUser: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("syncspace_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user, isAuthenticated: true });
        } catch {
          localStorage.removeItem("syncspace_user");
        }
      }
    }
  },

  /** Clear any error messages */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
