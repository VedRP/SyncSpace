/**
 * Team List Page — Minimal team list.
 */
"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
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

  const loadTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/team");
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load teams");
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
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const createTeam = async () => {
    const name = window.prompt("Team name?");
    if (!name) return;
    try {
      await apiRequest("/api/team", { method: "POST", body: { name } });
      await loadTeams();
    } catch (err) {
      setError(err.message || "Failed to create team");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Teams</h1>
            <p className="text-gray-500 mt-1">People working with you.</p>
          </div>
          <button
            onClick={createTeam}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md"
          >
            Create team
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="rounded-xl bg-white shadow-md p-6 text-gray-500 md:col-span-2">Loading…</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 md:col-span-2">{error}</div>
          ) : teams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 md:col-span-2">
              No teams yet. Click “Create team” to create one.
            </div>
          ) : null}

          {teams.map((t) => (
            <div
              key={t._id}
              className="rounded-xl bg-white border border-gray-200 shadow-md p-6 hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{(t.members || []).length} members</div>
                </div>
                <Link
                  href="/task/proj-1"
                  className="rounded-lg px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  View tasks
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
