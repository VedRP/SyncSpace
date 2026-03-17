/**
 * NotificationBell — Bell icon with unread badge and dropdown.
 */
"use client";

import { useState } from "react";
import NotificationList from "./NotificationList";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = 3; // Mock unread count

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0e0e16]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1a2e] border border-gray-700/50 rounded-2xl shadow-2xl animate-fade-in overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">
              Mark all read
            </span>
          </div>
          <NotificationList />
        </div>
      )}
    </div>
  );
}
