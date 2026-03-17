/**
 * TeamList — Renders a grid of TeamCards with a create button.
 */
"use client";

import { useState } from "react";
import useTeamStore from "@/store/teamStore";
import TeamCard from "./TeamCard";
import CreateTeamModal from "./CreateTeamModal";
import Button from "@/components/Button";

export default function TeamList() {
  const { teams } = useTeamStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your teams and collaborate</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Team
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {/* Create modal */}
      <CreateTeamModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
