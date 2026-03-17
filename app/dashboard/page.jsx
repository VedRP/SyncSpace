/**
 * Dashboard Page — Polished SaaS-style overview.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const stats = useMemo(
    () => [
      { label: "Tasks Completed", value: "128", delta: "+12%", tone: "indigo" },
      { label: "Active Projects", value: "6", delta: "+2", tone: "violet" },
      { label: "Team Members", value: "24", delta: "+3", tone: "emerald" },
    ],
    [],
  );

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const recent = useMemo(() => {
    const items = [];
    projects.slice(0, 2).forEach((p) =>
      items.push({ id: `p-${p._id}`, title: `Project “${p.name}”`, meta: "Project • just now" }),
    );
    teams.slice(0, 2).forEach((t) =>
      items.push({ id: `t-${t._id}`, title: `Team “${t.name}”`, meta: "Team • just now" }),
    );
    return items.slice(0, 4);
  }, [projects, teams]);

  const [messages, setMessages] = useState([
    { id: "m1", from: "them", text: "Quick sync at 5?" },
    { id: "m2", from: "me", text: "Yep. I’ll share the updated Kanban UI." },
    { id: "m3", from: "them", text: "Perfect — make it Trello-like and clean." },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const apiFetch = async (path) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [p, t] = await Promise.all([apiFetch("/api/project"), apiFetch("/api/team")]);
        setProjects(Array.isArray(p) ? p : []);
        setTeams(Array.isArray(t) ? t : []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), from: "me", text }]);
    setDraft("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-500 mt-1">Here’s what’s happening in your workspace.</p>
          </div>
          <Link
            href="/task/proj-1"
            className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md"
          >
            Open board
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => {
            return (
              <div
                key={s.label}
                className="rounded-xl bg-white shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">{s.label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <span className="text-blue-600 font-medium">{s.delta}</span> vs last week
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-xl bg-white shadow-md p-6 text-gray-500">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <section className="xl:col-span-2 space-y-4">
            <div className="rounded-xl bg-white shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">Recent Activity</div>
                  <div className="text-gray-500 mt-1">The latest changes across your workspace.</div>
                </div>
                <button className="rounded-lg px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 transition duration-200">
                  View all
                </button>
              </div>

              <div className="mt-4 divide-y divide-gray-100">
                {recent.length === 0 ? (
                  <div className="py-6 text-sm text-gray-500">No recent activity yet.</div>
                ) : (
                  recent.map((a) => (
                  <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{a.meta}</div>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">Your Projects</div>
                  <div className="text-gray-500 mt-1">Jump back into what you’re working on.</div>
                </div>
                <Link
                  href="/project"
                  className="rounded-lg px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  Browse
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 md:col-span-2">
                    No projects yet. Create one from the Projects page.
                  </div>
                ) : (
                  projects.map((p) => (
                  <Link
                    key={p._id}
                    href={`/project/${p._id}`}
                    className="group rounded-xl bg-white border border-gray-200 shadow-md p-4 hover:shadow-lg transition duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{p.name}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description || "—"}</div>
                      </div>
                      <span className="text-xs rounded-full bg-gray-900 text-white px-2 py-1">Project</span>
                    </div>
                    <div className="mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition duration-200">
                      Open →
                    </div>
                  </Link>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-xl bg-white shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-xl font-semibold">Team Chat</div>
              <div className="text-gray-500 mt-1">Mock chat (frontend only).</div>
            </div>

            <div ref={listRef} className="h-[420px] overflow-auto px-4 py-4 space-y-2 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "flex",
                    m.from === "me" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      m.from === "me"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md",
                    ].join(" ")}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Message your team…"
                />
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
