/**
 * useAuth Hook
 * Convenience wrapper around the auth store.
 */
import useAuthStore from "@/store/authStore";

export default function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, signup, logout, loadUser, clearError } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loadUser,
    clearError,
  };
}
