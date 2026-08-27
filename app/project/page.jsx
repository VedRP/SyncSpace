/**
 * Project List Page — Minimal project list.
 */
"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Development");
  const [budget, setBudget] = useState("");

  const apiRequest = async (path, { method = "GET", body } = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    if (res.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      throw new Error("Not authenticated");
    }
    if (!res.ok) throw new Error(json?.data?.message || "Request failed");
    return json.data;
  };

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/project");
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadProjects();
  }, [router]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/api/project", {
        method: "POST",
        body: {
          name,
          description,
          startDate,
          endDate,
          status,
          priority,
          category,
          budget: budget ? Number(budget) : 0,
        },
      });
      setShowModal(false);
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setStatus("active");
      setPriority("medium");
      setCategory("Development");
      setBudget("");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to create project");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-gray-500 mt-1">Your active projects.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md"
          >
            New project
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white shadow-md p-6 text-gray-500">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 md:col-span-2">
              No projects yet. Click “New project” to create one.
            </div>
          ) : null}

          {projects.map((p) => {
            const categoryColors = {
              Development: "bg-blue-50 text-blue-700 border border-blue-100",
              Design: "bg-purple-50 text-purple-700 border border-purple-100",
              Marketing: "bg-emerald-50 text-emerald-700 border border-emerald-100",
              Operations: "bg-amber-50 text-amber-700 border border-amber-100",
            };
            const priorityColors = {
              low: "bg-gray-100 text-gray-700 border border-gray-200",
              medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
              high: "bg-red-50 text-red-700 border border-red-200",
            };
            const statusColors = {
              planning: "bg-orange-50 text-orange-700 border border-orange-200",
              active: "bg-blue-50 text-blue-700 border border-blue-200",
              on_hold: "bg-purple-50 text-purple-700 border border-purple-200",
              completed: "bg-green-50 text-green-700 border border-green-200",
            };

            const formatDate = (d) => {
              if (!d) return "";
              const date = new Date(d);
              return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            };

            return (
              <div
                key={p._id}
                className="rounded-xl bg-white border border-gray-200 shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[p.category] || categoryColors.Development}`}>
                        {p.category || "Development"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[p.priority] || priorityColors.medium}`}>
                        {p.priority || "medium"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || statusColors.active}`}>
                        {p.status || "active"}
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-lg text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description || "No description"}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      {p.startDate || p.endDate ? (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {p.startDate ? formatDate(p.startDate) : "Start"} - {p.endDate ? formatDate(p.endDate) : "End"}
                          </span>
                        </div>
                      ) : null}

                      {p.budget ? (
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <span>Budget:</span>
                          <span>${p.budget.toLocaleString()}</span>
                        </div>
                      ) : null}

                      <div className="text-gray-400">ID: {p._id}</div>
                    </div>
                  </div>

                  <Link
                    href={`/task/${p._id}`}
                    className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-sm"
                  >
                    Open
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold">New Project</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Short project description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date / Deadline</label>
                  <input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
