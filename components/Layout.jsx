/**
 * Layout — Polished dashboard layout wrapper.
 * Sidebar + topbar + content area.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const pageTitle = useMemo(() => {
    if (!pathname) return "Dashboard";
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/team") return "Teams";
    if (pathname.startsWith("/team/")) return "Team";
    if (pathname === "/project") return "Projects";
    if (pathname.startsWith("/project/")) return "Project";
    if (pathname.startsWith("/task/")) return "Tasks";
    return "SyncSpace";
  }, [pathname]);

  const notifications = useMemo(
    () => [
      { id: "n1", title: "New task assigned", body: "“Design UI” was added to your board.", time: "2m" },
      { id: "n2", title: "Project updated", body: "SyncSpace UI status changed.", time: "1h" },
      { id: "n3", title: "Team invite", body: "Asha joined Core Team.", time: "Yesterday" },
    ],
    [],
  );

  useEffect(() => {
    const onDown = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 min-w-0">
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
              <div className="h-16 px-6 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">SyncSpace</div>
                  <h1 className="text-xl font-semibold truncate">{pageTitle}</h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      placeholder="Search…"
                      className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="relative" ref={notifRef}>
                    <button
                      type="button"
                      onClick={() => setNotifOpen((v) => !v)}
                      className="relative rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50 active:scale-[0.98] transition duration-200 shadow-md"
                      aria-label="Notifications"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                        3
                      </span>
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                          <div className="text-sm font-semibold">Notifications</div>
                          <button
                            type="button"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Close
                          </button>
                        </div>
                        <div className="max-h-80 overflow-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition duration-200">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium">{n.title}</div>
                                  <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
                                </div>
                                <div className="text-xs text-gray-400 shrink-0">{n.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
                          This is mock UI (no backend).
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 active:scale-[0.98] transition duration-200 shadow-md flex items-center gap-2"
                    aria-label="User menu"
                  >
                    <span className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                      VP
                    </span>
                    <span className="hidden sm:block text-sm font-semibold">Vedant</span>
                    <svg className="hidden sm:block w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            <main className="p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
