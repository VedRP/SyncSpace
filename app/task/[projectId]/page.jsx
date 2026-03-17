/**
 * Task / Kanban Page — Trello-like Kanban (UI-only).
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";

export default function TaskPage({ params }) {
  const router = useRouter();
  const { projectId } = params;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = useMemo(
    () => [
      { key: "todo", title: "To Do", hint: "Next up" },
      { key: "progress", title: "In Progress", hint: "In the works" },
      { key: "done", title: "Done", hint: "Shipped" },
    ],
    [],
  );

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

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/task/${projectId}`);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
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
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, router]);

  const addTask = async () => {
    const title = window.prompt("Task title?");
    if (!title) return;
    try {
      await apiRequest("/api/task", { method: "POST", body: { title, status: "todo", projectId } });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to create task");
    }
  };

  const setStatus = async (taskId, status) => {
    try {
      await apiRequest(`/api/task/${taskId}`, { method: "PUT", body: { status } });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    } catch (err) {
      setError(err.message || "Failed to update task");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Tasks</h2>
            <p className="text-gray-500 mt-1">
              Project <span className="font-medium text-gray-900">{projectId}</span>
            </p>
          </div>
          <button
            onClick={addTask}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md"
          >
            + Add Task
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white shadow-md p-6 text-gray-500">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const items = tasks.filter((t) => t.status === col.key);
            return (
              <section
                key={col.key}
                className="rounded-xl bg-gray-50 border border-gray-200 p-4 shadow-md"
              >
                <div className="flex items-center justify-between px-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{col.title}</h3>
                      <span className="text-xs rounded-full bg-white border border-gray-200 px-2 py-0.5 text-gray-500">
                        {items.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{col.hint}</p>
                  </div>
                  <button className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition duration-200">
                    + Add
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                      No tasks here yet.
                    </div>
                  ) : (
                    items.map((t) => (
                      <article
                        key={t._id}
                        className="rounded-xl bg-white border border-gray-200 shadow-md p-4 hover:shadow-lg transition duration-200 cursor-pointer"
                      >
                        <div className="text-sm font-semibold">{t.title}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1">
                            {t.status}
                          </span>
                          <div className="flex gap-1">
                            {col.key !== "todo" ? (
                              <button
                                type="button"
                                onClick={() => setStatus(t._id, "todo")}
                                className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition duration-200"
                              >
                                To Do
                              </button>
                            ) : null}
                            {col.key !== "progress" ? (
                              <button
                                type="button"
                                onClick={() => setStatus(t._id, "progress")}
                                className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition duration-200"
                              >
                                In Prog
                              </button>
                            ) : null}
                            {col.key !== "done" ? (
                              <button
                                type="button"
                                onClick={() => setStatus(t._id, "done")}
                                className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition duration-200"
                              >
                                Done
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
