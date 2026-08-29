"use client";

import { useState } from "react";
import useChatStore from "@/store/chatStore";

export default function ConversationList({
  currentUserId,
  onSelectConversation,
  onOpenDirectory,
  onStartInstantMeeting,
  onCreateGroup,
}) {
  const {
    conversations,
    activeConversationId,
    onlineUsers,
    unreadCounts,
    isLoadingChats,
  } = useChatStore();

  const [tab, setTab] = useState("all"); // 'all' | 'direct' | 'group'
  const [search, setSearch] = useState("");

  const onlineSet = new Map(onlineUsers.map((u) => [u.userId, u.status]));

  const filteredConversations = conversations.filter((conv) => {
    // Filter by tab
    if (tab === "direct" && conv.type !== "direct") return false;
    if (tab === "group" && conv.type === "direct") return false;

    // Filter by search
    if (!search.trim()) return true;
    const q = search.toLowerCase();

    if (conv.type === "direct") {
      const other = conv.participants?.find((p) => String(p._id) !== String(currentUserId));
      return other?.name?.toLowerCase().includes(q) || other?.email?.toLowerCase().includes(q);
    }
    return conv.name?.toLowerCase().includes(q);
  });

  return (
    <aside className="w-80 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      {/* Header & Quick Action Buttons */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Chat</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Teams
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Meet Now Button */}
            <button
              type="button"
              onClick={onStartInstantMeeting}
              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition duration-150 shadow-sm"
              title="Start Instant Video Meeting (Meet Now)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={onOpenDirectory}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition duration-150 shadow-sm"
              title="New Chat / Employee Directory"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`flex-1 py-1.5 rounded-lg text-center transition duration-150 ${
              tab === "all" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTab("direct")}
            className={`flex-1 py-1.5 rounded-lg text-center transition duration-150 ${
              tab === "direct" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setTab("group")}
            className={`flex-1 py-1.5 rounded-lg text-center transition duration-150 ${
              tab === "group" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"
            }`}
          >
            Channels
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {isLoadingChats ? (
          <div className="p-6 text-center text-xs text-gray-400">Loading chats…</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">No chats found.</p>
            <button
              type="button"
              onClick={onOpenDirectory}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Find an employee
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isDirect = conv.type === "direct";
            const otherUser = isDirect
              ? conv.participants?.find((p) => String(p._id) !== String(currentUserId))
              : null;

            const name = isDirect ? otherUser?.name || "Colleague" : conv.name || "Channel";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            const isOnline = isDirect && otherUser && onlineSet.has(String(otherUser._id));
            const isActive = activeConversationId === conv._id;
            const unread = unreadCounts[conv._id] || 0;

            const lastText = conv.lastMessage?.text || "No messages yet";

            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => onSelectConversation(conv._id)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-50/70 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                {/* Avatar with Presence Indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      isDirect
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {initials}
                  </div>
                  {isDirect && (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
                    {conv.lastMessage?.createdAt && (
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-gray-500 truncate">{lastText}</p>
                    {unread > 0 && (
                      <span className="shrink-0 h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
