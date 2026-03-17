/**
 * Navbar — Top navigation bar with search, notifications, and user avatar.
 * Used inside the dashboard layout.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useState } from "react";
import NotificationBell from "@/modules/notification/NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-40 w-full h-16 glass border-b border-gray-700/40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search bar */}
        <div className="relative w-80 hidden md:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search projects, tasks, teams..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#12121a] border border-gray-700/50 rounded-xl text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
          />
        </div>

        {/* Right side: notifications + user */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notification bell */}
          <NotificationBell />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-200">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.role || "Member"}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-gray-700/50 rounded-xl shadow-2xl animate-fade-in overflow-hidden">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  Dashboard
                </Link>
                <hr className="border-gray-700/50" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
