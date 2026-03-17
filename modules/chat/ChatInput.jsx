/**
 * ChatInput — Message input bar with send button.
 */
"use client";

import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-t border-gray-700/30 bg-[#0e0e16]">
      {/* Attachment button */}
      <button
        type="button"
        className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      {/* Input */}
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-700/30 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-violet-600 transition-all cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
