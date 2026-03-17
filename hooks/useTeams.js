/**
 * useTeams Hook
 * Convenience wrapper around the team store.
 */
import useTeamStore from "@/store/teamStore";

export default function useTeams() {
  const { teams, isLoading, addTeam, removeTeam, updateTeam } = useTeamStore();

  return {
    teams,
    isLoading,
    addTeam,
    removeTeam,
    updateTeam,
  };
}
