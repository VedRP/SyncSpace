/**
 * Sidebar — Product-style navigation (Notion/Trello-ish).
 * Highlights active route and supports collapse.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    label: "Teams",
    href: "/team",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/project",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/task/proj-1",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        "sticky top-0 h-screen flex flex-col",
        "border-r border-gray-200 bg-white",
        "transition-[width] duration-200",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">SyncSpace</div>
              <div className="text-xs text-gray-500 truncate">Team workspace</div>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-gray-700 hover:bg-gray-100 border border-transparent",
              ].join(" ")}
              title={collapsed ? item.label : undefined}
            >
              <span className={["shrink-0", isActive ? "text-blue-600" : "text-gray-500"].join(" ")}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
              VP
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Vedant Patil</div>
                <div className="text-xs text-gray-500 truncate">Hackathon mode</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
