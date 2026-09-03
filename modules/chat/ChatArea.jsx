"use client";

import { useEffect, useRef, useState } from "react";
import useChatStore from "@/store/chatStore";
import useWebRTC from "@/hooks/useWebRTC";
import useSocket from "@/hooks/useSocket";

const QUICK_EMOJIS = ["👍", "❤️", "🎉", "🔥", "🚀", "👏", "😊"];

export default function ChatArea({ currentUserId, onStartInstantMeeting, onTogglePin }) {
  const {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    onlineUsers,
    isLoadingMessages,
  } = useChatStore();

  const { makeCall } = useWebRTC();
  const { sendMessage, sendDeleteMessage, sendTyping, sendReaction } = useSocket();

  const [text, setText] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const jumpToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  const renderHighlightedText = (content, query) => {
    if (!query || !query.trim() || !content) return content;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = content.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-xs px-0.5 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const activeConv = conversations.find((c) => c._id === activeConversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Welcome to SyncSpace Teams Chat</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          Select a chat from the sidebar or start a new conversation to chat, make audio/video calls, or launch a conference.
        </p>
      </div>
    );
  }

  const isDirect = activeConv.type === "direct";
  const otherUser = isDirect
    ? activeConv.participants?.find((p) => String(p._id) !== String(currentUserId))
    : null;

  const title = isDirect ? otherUser?.name || "Colleague" : activeConv.name || "Channel";
  const initials = title
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isOnline = isDirect && otherUser && onlineUsers.some((u) => u.userId === String(otherUser._id));
  const activeTypers = typingUsers[activeConv._id] || [];

  const handleCall = async (type) => {
    if (isDirect && otherUser) {
      try {
        await makeCall({ recipient: otherUser, callType: type, conversationId: activeConv._id });
      } catch (err) {
        alert(err.message || "Could not start call");
      }
    } else {
      // Group channel -> Start meeting
      onStartInstantMeeting(activeConv.name || "Channel Meeting");
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    sendTyping(activeConv._id, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(activeConv._id, false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    const draft = text.trim();
    const currentReplyTo = replyingTo?.messageId;
    setText("");
    setReplyingTo(null);
    sendTyping(activeConv._id, false);

    try {
      await sendMessage({
        conversationId: activeConv._id,
        text: draft,
        replyTo: currentReplyTo,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleReactionClick = (messageId, emoji) => {
    sendReaction(messageId, emoji, activeConv._id);
    setShowEmojiMenu(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await sendDeleteMessage(messageId, activeConv._id);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const matchingCount = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.trim().toLowerCase())).length
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Active Chat Header */}
      <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                isDirect ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" : "bg-slate-800 text-white"
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

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-gray-900 truncate">{title}</h2>
              {onTogglePin && (
                <button
                  type="button"
                  onClick={() => onTogglePin(activeConv._id)}
                  className={`p-1 rounded-md transition ${
                    activeConv.pinned ? "text-blue-600 hover:bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                  title={activeConv.pinned ? "Unpin conversation" : "Pin conversation"}
                >
                  <svg className="w-3.5 h-3.5" fill={activeConv.pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {isDirect ? (isOnline ? "🟢 Active now" : "⚪ Offline") : `${activeConv.participants?.length || 0} members`}
            </p>
          </div>
        </div>

        {/* Action Controls (Search, Audio Call, Video Call, Meet Now) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery("");
            }}
            className={`p-2 rounded-xl transition duration-150 shadow-sm ${
              isSearchOpen || searchQuery
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
            title="Search in conversation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Audio Call Button */}
          <button
            type="button"
            onClick={() => handleCall("audio")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition duration-150 shadow-sm"
            title="Audio Call"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a11.042 11.042 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="hidden sm:inline">Audio Call</span>
          </button>

          {/* Video Call Button */}
          <button
            type="button"
            onClick={() => handleCall("video")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-150 shadow-sm"
            title="Video Call"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Video Call</span>
          </button>

          {/* Meet Now (Conference) */}
          <button
            type="button"
            onClick={() => onStartInstantMeeting(title)}
            className="flex items-center gap-1.5 p-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition duration-150"
            title="Start Conference Meeting"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 bg-white border border-blue-200 rounded-xl px-3 py-1.5 shadow-xs">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages in this chat…"
              className="w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {searchQuery.trim() && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {matchingCount} {matchingCount === 1 ? "match" : "matches"}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
        {isLoadingMessages ? (
          <div className="text-center py-10 text-xs text-gray-400">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <div className="text-sm font-semibold text-gray-600">No messages here yet</div>
            <p className="text-xs">Send a message to say hello! 👋</p>
          </div>
        ) : searchQuery.trim() && matchingCount === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <div className="text-sm font-semibold text-gray-600">No matching messages found</div>
            <p className="text-xs">Try searching for a different keyword.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender?._id || msg.sender) === String(currentUserId);
            const senderName = msg.sender?.name || (isMe ? "You" : "Colleague");
            const senderInitials = senderName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            // Call log message rendering
            if (msg.messageType === "call_log") {
              return (
                <div key={msg._id} className="flex justify-center my-2">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-200/80 text-xs text-gray-700 font-medium shadow-sm">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a11.042 11.042 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{renderHighlightedText(msg.text, searchQuery)}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg._id}
                id={`msg-${msg._id}`}
                className={`flex gap-3 group relative p-1 rounded-2xl transition duration-300 ${
                  highlightedMessageId === msg._id ? "bg-blue-100/70 ring-2 ring-blue-400" : ""
                } ${isMe ? "justify-end" : "justify-start"}`}
              >
                {/* Left Avatar (for others) */}
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-1">
                    {senderInitials}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[70%] space-y-1 ${isMe ? "items-end text-right" : "items-start"}`}>
                  <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400">
                    {!isMe && <span className="font-semibold text-gray-700">{senderName}</span>}
                    <span>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="relative group/bubble">
                    {msg.isDeleted ? (
                      <div
                        className={`p-2.5 px-3.5 rounded-2xl text-xs italic flex items-center gap-1.5 shadow-sm ${
                          isMe
                            ? "bg-blue-600/70 text-blue-100 rounded-br-sm"
                            : "bg-gray-100 border border-gray-200 text-gray-500 rounded-bl-sm"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 opacity-75 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>This message was deleted</span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm transition duration-150 ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          {msg.replyTo && (
                            <div
                              onClick={() => jumpToMessage(msg.replyTo._id || msg.replyTo)}
                              className={`mb-2 p-1.5 px-2.5 rounded-xl border-l-2 text-xs text-left cursor-pointer transition select-none ${
                                isMe
                                  ? "bg-blue-700/60 border-white/60 text-white hover:bg-blue-700/80"
                                  : "bg-gray-100 border-blue-500 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <div className="font-semibold text-[11px] opacity-95">
                                {msg.replyTo.sender?.name || "Original message"}
                              </div>
                              <div className="truncate text-[11px] opacity-85">
                                {msg.replyTo.text || "Message preview"}
                              </div>
                            </div>
                          )}
                          {renderHighlightedText(msg.text, searchQuery)}
                        </div>

                        <div
                          className={`absolute -top-7 ${
                            isMe ? "right-0" : "left-0"
                          } hidden group-hover/bubble:flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 shadow-md z-10`}
                        >
                          {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReactionClick(msg._id, emoji)}
                              className="hover:scale-125 transition duration-150 text-xs p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setReplyingTo({ messageId: msg._id, text: msg.text, senderName })}
                            className="hover:scale-110 text-gray-400 hover:text-blue-600 transition duration-150 p-0.5 ml-0.5 border-l border-gray-100"
                            title="Reply"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6-6m-6 6l6 6" />
                            </svg>
                          </button>
                          {isMe && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="hover:scale-110 text-gray-400 hover:text-red-500 transition duration-150 p-0.5 ml-0.5 border-l border-gray-100"
                              title="Delete message"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Render Message Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700 shadow-xs"
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Avatar (for me) */}
                {isMe && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-1">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {activeTypers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{activeTypers.join(", ")} is typing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rich Chat Input Bar */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend} className="space-y-2">
          {replyingTo && (
            <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6-6m-6 6l6 6" />
                </svg>
                <span className="truncate">
                  Replying to <strong className="font-semibold">{replyingTo.senderName}</strong>: <span className="opacity-80 italic">"{replyingTo.text || "Message"}"</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-gray-700 ml-2 font-bold px-1 text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Emoji Strip */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((prev) => prev + emoji)}
                className="hover:scale-125 transition duration-150 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition duration-150">
            <textarea
              rows={1}
              value={text}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${title}… (Press Enter to send)`}
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none resize-none max-h-32 placeholder:text-gray-400"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 shadow-sm"
              title="Send Message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
