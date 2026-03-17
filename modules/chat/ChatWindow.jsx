/**
 * ChatWindow — Full chat interface with message list, input, and auto-scroll.
 * Uses local state to simulate real-time messaging.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

// Mock conversation data
const initialMessages = [
  {
    id: 1,
    name: "Alice",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice",
    text: "Hey team! The new dashboard looks amazing 🎉",
    time: "10:30 AM",
    senderId: "u1",
  },
  {
    id: 2,
    name: "Bob",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob",
    text: "Thanks! I just finished the activity graph component. Let me know if you want any changes.",
    time: "10:32 AM",
    senderId: "u2",
  },
  {
    id: 3,
    name: "You",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=You",
    text: "Looks great! Can we add a weekly toggle for the chart?",
    time: "10:35 AM",
    senderId: "self",
  },
  {
    id: 4,
    name: "Alice",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice",
    text: "Good idea! I'll create a ticket for that. Also, the Kanban board drag-and-drop is working smoothly now.",
    time: "10:37 AM",
    senderId: "u1",
  },
  {
    id: 5,
    name: "Charlie",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Charlie",
    text: "Just pushed the new color palette. Check the design system page! 🎨",
    time: "10:40 AM",
    senderId: "u3",
  },
];

export default function ChatWindow() {
  const [messages, setMessages] = useState(initialMessages);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Handle sending a new message */
  const handleSend = (text) => {
    const newMessage = {
      id: Date.now(),
      name: "You",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderId: "self",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate a bot/team reply after 1.5s
    setTimeout(() => {
      const replies = [
        "That's a great point! Let me look into it.",
        "I'll get right on it 👍",
        "Sure, let's discuss this in the next standup.",
        "Already working on it! Should be done by EOD.",
        "Nice catch! I'll update the design.",
      ];
      const reply = {
        id: Date.now() + 1,
        name: "Alice",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        senderId: "u1",
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#12121a] rounded-2xl border border-gray-700/30 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-700/30 bg-[#0e0e16]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
          FS
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Frontend Squad</h3>
          <p className="text-[11px] text-emerald-400">● 4 members online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSender={msg.senderId === "self"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
