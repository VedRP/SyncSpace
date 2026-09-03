/**
 * Chat & Calling Store (Zustand)
 * Manages conversations, messages, real-time presence, 1:1 audio/video calls,
 * and multi-party conference rooms.
 */
import { create } from "zustand";

const useChatStore = create((set, get) => ({
  // --- Conversations & Messages ---
  conversations: [],
  activeConversationId: null,
  messages: [],
  employees: [],
  onlineUsers: [],
  typingUsers: {}, // { conversationId: [userName1, userName2] }
  unreadCounts: {}, // { conversationId: count }
  isLoadingChats: false,
  isLoadingMessages: false,

  setConversations: (conversations) => {
    const sorted = [...conversations].sort((a, b) => {
      if (Boolean(b.pinned) !== Boolean(a.pinned)) {
        return Boolean(b.pinned) ? 1 : -1;
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    set({ conversations: sorted });
  },
  togglePinConversation: (conversationId) => {
    set((state) => {
      const updated = state.conversations.map((conv) => {
        if (conv._id === conversationId) {
          return { ...conv, pinned: !conv.pinned };
        }
        return conv;
      });
      updated.sort((a, b) => {
        if (Boolean(b.pinned) !== Boolean(a.pinned)) {
          return Boolean(b.pinned) ? 1 : -1;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      return { conversations: updated };
    });
  },
  setActiveConversationId: (id) => {
    set((state) => ({
      activeConversationId: id,
      unreadCounts: { ...state.unreadCounts, [id]: 0 },
    }));
  },
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    set((state) => {
      // Check if message already exists
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;

      const isCurrentConv = state.activeConversationId === message.conversation;
      const newMessages = isCurrentConv ? [...state.messages, message] : state.messages;

      // Update conversations list lastMessage and order
      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
          };
        }
        return conv;
      });

      updatedConversations.sort((a, b) => {
        if (Boolean(b.pinned) !== Boolean(a.pinned)) {
          return Boolean(b.pinned) ? 1 : -1;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      const newUnread = { ...state.unreadCounts };
      if (!isCurrentConv && message.conversation) {
        newUnread[message.conversation] = (newUnread[message.conversation] || 0) + 1;
      }

      return {
        messages: newMessages,
        conversations: updatedConversations,
        unreadCounts: newUnread,
      };
    });
  },
  updateMessage: (updatedMsg) => {
    set((state) => ({
      messages: state.messages.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)),
    }));
  },
  setEmployees: (employees) => set({ employees }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setTyping: (conversationId, userName, isTyping) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      let updated;
      if (isTyping) {
        updated = Array.from(new Set([...current, userName]));
      } else {
        updated = current.filter((name) => name !== userName);
      }
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    });
  },
  setLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  // --- 1:1 Call State ---
  callState: {
    isOpen: false,
    isIncoming: false,
    isOutgoing: false,
    isConnected: false,
    callType: "video", // 'audio' | 'video'
    otherUser: null, // { _id, name, email, avatar }
    conversationId: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    incomingSignal: null,
    duration: 0,
  },

  startOutgoingCall: ({ otherUser, callType, conversationId, localStream }) => {
    set({
      callState: {
        isOpen: true,
        isIncoming: false,
        isOutgoing: true,
        isConnected: false,
        callType: callType || "video",
        otherUser,
        conversationId,
        localStream,
        remoteStream: null,
        isMuted: false,
        isCameraOff: callType === "audio",
        isScreenSharing: false,
        incomingSignal: null,
        duration: 0,
      },
    });
  },

  receiveIncomingCall: ({ caller, callType, conversationId, signalData }) => {
    set({
      callState: {
        isOpen: true,
        isIncoming: true,
        isOutgoing: false,
        isConnected: false,
        callType: callType || "video",
        otherUser: caller,
        conversationId,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isCameraOff: callType === "audio",
        isScreenSharing: false,
        incomingSignal: signalData,
        duration: 0,
      },
    });
  },

  setCallConnected: (remoteStream) => {
    set((state) => ({
      callState: {
        ...state.callState,
        isConnected: true,
        isIncoming: false,
        isOutgoing: false,
        remoteStream,
      },
    }));
  },

  updateCallMedia: (mediaUpdates) => {
    set((state) => ({
      callState: { ...state.callState, ...mediaUpdates },
    }));
  },

  setCallDuration: (duration) => {
    set((state) => ({
      callState: { ...state.callState, duration },
    }));
  },

  endCallState: () => {
    const { localStream, remoteStream } = get().callState;
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    set({
      callState: {
        isOpen: false,
        isIncoming: false,
        isOutgoing: false,
        isConnected: false,
        callType: "video",
        otherUser: null,
        conversationId: null,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false,
        incomingSignal: null,
        duration: 0,
      },
    });
  },

  // --- Multi-Party Conference Room State ---
  conferenceState: {
    isOpen: false,
    roomId: null,
    roomName: "",
    participants: [], // array of { userId, user, isMuted, isVideoOff, isScreenSharing, handRaised }
    localStream: null,
    remoteStreams: {}, // { userId: MediaStream }
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    handRaised: false,
    activeSpeaker: null,
    messages: [],
    showParticipantsList: false,
    showChat: false,
  },

  joinConferenceRoom: ({ roomId, roomName, localStream }) => {
    set({
      conferenceState: {
        isOpen: true,
        roomId,
        roomName: roomName || `Meeting - ${roomId}`,
        participants: [],
        localStream,
        remoteStreams: {},
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false,
        handRaised: false,
        activeSpeaker: null,
        messages: [],
        showParticipantsList: false,
        showChat: false,
      },
    });
  },

  setConferenceParticipants: (participants) => {
    set((state) => ({
      conferenceState: { ...state.conferenceState, participants },
    }));
  },

  addConferenceRemoteStream: (userId, stream) => {
    set((state) => ({
      conferenceState: {
        ...state.conferenceState,
        remoteStreams: { ...state.conferenceState.remoteStreams, [userId]: stream },
      },
    }));
  },

  removeConferenceRemoteStream: (userId) => {
    set((state) => {
      const updated = { ...state.conferenceState.remoteStreams };
      if (updated[userId]) {
        updated[userId].getTracks().forEach((t) => t.stop());
        delete updated[userId];
      }
      return {
        conferenceState: { ...state.conferenceState, remoteStreams: updated },
      };
    });
  },

  updateConferenceMedia: (mediaUpdates) => {
    set((state) => ({
      conferenceState: { ...state.conferenceState, ...mediaUpdates },
    }));
  },

  addConferenceMessage: (message) => {
    set((state) => ({
      conferenceState: {
        ...state.conferenceState,
        messages: [...state.conferenceState.messages, message],
      },
    }));
  },

  toggleConferenceParticipants: () => {
    set((state) => ({
      conferenceState: {
        ...state.conferenceState,
        showParticipantsList: !state.conferenceState.showParticipantsList,
      },
    }));
  },

  toggleConferenceChat: () => {
    set((state) => ({
      conferenceState: {
        ...state.conferenceState,
        showChat: !state.conferenceState.showChat,
      },
    }));
  },

  leaveConferenceState: () => {
    const { localStream, remoteStreams } = get().conferenceState;
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    Object.values(remoteStreams).forEach((st) => {
      if (st) st.getTracks().forEach((t) => t.stop());
    });
    set({
      conferenceState: {
        isOpen: false,
        roomId: null,
        roomName: "",
        participants: [],
        localStream: null,
        remoteStreams: {},
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false,
        handRaised: false,
        activeSpeaker: null,
        messages: [],
        showParticipantsList: false,
        showChat: false,
      },
    });
  },
}));

export default useChatStore;
