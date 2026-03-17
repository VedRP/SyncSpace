/**
 * CreateTeamModal — Modal form to create a new team.
 */
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useTeamStore from "@/store/teamStore";

const colorOptions = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#22d3ee", "#8b5cf6"];

export default function CreateTeamModal({ isOpen, onClose }) {
  const { addTeam } = useTeamStore();
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      addTeam({
        name: form.name,
        description: form.description,
        color: form.color,
        members: [
          {
            id: "u-self",
            name: "You",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=You",
            role: "Lead",
          },
        ],
      });
      setForm({ name: "", description: "", color: "#6366f1" });
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          placeholder="e.g. Design Team"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea
            placeholder="What does this team do?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[#12121a] border border-gray-700/50 text-gray-100 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition resize-none"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Team Color</label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                  form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}
