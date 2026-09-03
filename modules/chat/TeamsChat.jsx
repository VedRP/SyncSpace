"use client";

import { useEffect, useState, useCallback } from "react";
import useChatStore from "@/store/chatStore";
import useSocket from "@/hooks/useSocket";
import useWebRTC from "@/hooks/useWebRTC";
import ConversationList from "./ConversationList";
import ChatArea from "./ChatArea";
import EmployeeDirectoryModal from "./EmployeeDirectoryModal";

export default function TeamsChat() {
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    setMessages,
    employees,
    setEmployees,
    setLoadingChats,
    setLoadingMessages,
    togglePinConversation,
    updateConversation,
  } = useChatStore();

  const { joinConversation, leaveConversation } = useSocket();
  const { startConference } = useWebRTC();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");

  // Load current user ID from token / localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("syncspace_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUserId(u.id || u._id);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`http://localhost:5000${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.data?.message || "API request failed");
    return json.data;
  }, []);

  // Fetch initial conversations & employees
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingChats(true);
      try {
        const [convList, empList] = await Promise.all([
          apiFetch("/api/chat/conversations"),
          apiFetch("/api/chat/users"),
        ]);
        if (mounted) {
          setConversations(convList || []);
          setEmployees(empList || []);
          if (convList && convList.length > 0 && !activeConversationId) {
            setActiveConversationId(convList[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load chat data:", err);
      } finally {
        if (mounted) setLoadingChats(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [apiFetch, setConversations, setEmployees, setActiveConversationId, setLoadingChats, activeConversationId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    joinConversation(activeConversationId);
    let mounted = true;

    (async () => {
      setLoadingMessages(true);
      try {
        const msgs = await apiFetch(`/api/chat/conversations/${activeConversationId}/messages`);
        if (mounted) {
          setMessages(msgs || []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    })();

    return () => {
      mounted = false;
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId, apiFetch, joinConversation, leaveConversation, setMessages, setLoadingMessages]);

  // Start or select 1:1 chat with employee
  const handleSelectEmployee = async (employee) => {
    try {
      const conv = await apiFetch("/api/chat/conversations/direct", {
        method: "POST",
        body: JSON.stringify({ recipientId: employee._id }),
      });

      // Update conversations if not already in list
      if (!conversations.some((c) => c._id === conv._id)) {
        setConversations([conv, ...conversations]);
      }
      setActiveConversationId(conv._id);
    } catch (err) {
      alert(err.message || "Failed to start direct conversation");
    }
  };

  // Start instant conference meeting
  const handleStartInstantMeeting = async (customRoomName) => {
    const roomId = `meeting-${Date.now().toString(36)}`;
    try {
      await startConference({
        roomId,
        roomName: typeof customRoomName === "string" ? customRoomName : `Quick Meeting (${roomId})`,
      });
    } catch (err) {
      alert(err.message || "Failed to join conference meeting");
    }
  };

  // Create new group/channel
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const conv = await apiFetch("/api/chat/conversations/group", {
        method: "POST",
        body: JSON.stringify({
          name: groupName.trim(),
          type: "channel",
        }),
      });

      setConversations([conv, ...conversations]);
      setActiveConversationId(conv._id);
      setIsNewGroupModalOpen(false);
      setGroupName("");
    } catch (err) {
      alert(err.message || "Failed to create channel");
    }
  };

  const handleTogglePin = async (conversationId) => {
    try {
      togglePinConversation(conversationId);
      await apiFetch(`/api/chat/conversations/${conversationId}/pin`, {
        method: "PUT",
      });
    } catch (err) {
      togglePinConversation(conversationId);
      console.error(err);
    }
  };

  const handleAddParticipants = async (conversationId, participantIds) => {
    try {
      const updated = await apiFetch(`/api/chat/conversations/${conversationId}/participants`, {
        method: "POST",
        body: JSON.stringify({ participantIds }),
      });
      updateConversation(updated);
    } catch (err) {
      alert(err.message || "Failed to add participants");
    }
  };

  const handleRemoveParticipant = async (conversationId, participantId) => {
    try {
      const updated = await apiFetch(`/api/chat/conversations/${conversationId}/participants/${participantId}`, {
        method: "DELETE",
      });
      updateConversation(updated);
    } catch (err) {
      alert(err.message || "Failed to remove participant");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl">
      {/* Sidebar: Conversation List */}
      <ConversationList
        currentUserId={currentUserId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onStartInstantMeeting={() => handleStartInstantMeeting("General Meeting")}
        onCreateGroup={() => setIsNewGroupModalOpen(true)}
        onTogglePin={handleTogglePin}
      />

      {/* Main Area: Active Chat Window */}
      <ChatArea
        currentUserId={currentUserId}
        onStartInstantMeeting={handleStartInstantMeeting}
        onTogglePin={handleTogglePin}
        employees={employees}
        onAddParticipants={handleAddParticipants}
        onRemoveParticipant={handleRemoveParticipant}
      />

      {/* Modals & Overlays */}
      <EmployeeDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectUser={handleSelectEmployee}
      />

      {/* New Group / Channel Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Create Channel</h3>
            <p className="text-xs text-gray-500 mb-4">
              Channels are great for team-wide updates and topic discussions.
            </p>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. #design-squad or Frontend Updates"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
