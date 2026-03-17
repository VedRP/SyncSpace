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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const createProject = async () => {
    const name = window.prompt("Project name?");
    if (!name) return;
    const description = window.prompt("Short description?") || "";
    try {
      await apiRequest("/api/project", { method: "POST", body: { name, description } });
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
            onClick={createProject}
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

          {projects.map((p) => (
            <div
              key={p._id}
              className="rounded-xl bg-white border border-gray-200 shadow-md p-6 hover:shadow-lg transition duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{p.description || "—"}</div>
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {p._id}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/task/${p._id}`}
                  className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
