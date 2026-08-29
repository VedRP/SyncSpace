"use client";

import { useState } from "react";
import useChatStore from "@/store/chatStore";
import useWebRTC from "@/hooks/useWebRTC";

export default function EmployeeDirectoryModal({ isOpen, onClose, onSelectUser }) {
  const { employees, onlineUsers } = useChatStore();
  const { makeCall } = useWebRTC();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const onlineSet = new Map(onlineUsers.map((u) => [u.userId, u.status]));

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return emp.name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q);
  });

  const handleStartCall = async (user, type) => {
    onClose();
    try {
      await makeCall({ recipient: user, callType: type });
    } catch (err) {
      alert(err.message || "Failed to start call");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Start a Chat or Call</h3>
            <p className="text-xs text-gray-500 mt-0.5">Find a colleague in your workspace</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No employees found matching &quot;{search}&quot;.
            </div>
          ) : (
            filtered.map((emp) => {
              const status = onlineSet.get(emp._id) || "offline";
              const isOnline = status !== "offline";
              const initials = emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={emp._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition duration-150 group"
                >
                  <div
                    onClick={() => {
                      onSelectUser(emp);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {initials}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                        title={isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
                        {emp.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{emp.email}</div>
                    </div>
                  </div>

                  {/* Direct Call Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartCall(emp, "audio")}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-100/50 transition duration-150"
                      title="Audio Call"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a11.042 11.042 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartCall(emp, "video")}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-100/50 transition duration-150"
                      title="Video Call"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
