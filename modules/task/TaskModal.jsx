/**
 * TaskModal — Modal for creating a new task.
 */
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useTaskStore from "@/store/taskStore";

export default function TaskModal({ isOpen, onClose, projectId }) {
  const { addTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    setTimeout(() => {
      addTask({
        ...form,
        projectId: projectId || "proj-1",
        assignee: {
          name: "You",
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=You",
        },
      });
      setForm({ title: "", description: "", priority: "medium", status: "todo" });
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Build user profile page"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea
            placeholder="Describe the task..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[#12121a] border border-gray-700/50 text-gray-100 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition resize-none"
          />
        </div>

        {/* Priority select */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`
                  flex-1 py-2 rounded-xl text-xs font-semibold uppercase transition-all cursor-pointer
                  ${
                    form.priority === p
                      ? p === "high"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : p === "medium"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#12121a] text-gray-500 border border-gray-700/30 hover:border-gray-600"
                  }
                `}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
