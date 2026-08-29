"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import useChatStore from "@/store/chatStore";

let globalSocket = null;

export function getSocket() {
  return globalSocket;
}

export default function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const {
    addMessage,
    updateMessage,
    setOnlineUsers,
    setTyping,
    receiveIncomingCall,
    endCallState,
    setConferenceParticipants,
    addConferenceRemoteStream,
    removeConferenceRemoteStream,
    addConferenceMessage,
    updateConferenceMedia,
  } = useChatStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    if (!globalSocket || !globalSocket.connected) {
      globalSocket = io("http://localhost:5000", {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = globalSocket;

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onOnlineUsers(users) {
      setOnlineUsers(users);
    }

    function onNewMessage(message) {
      addMessage(message);
    }

    function onMessageUpdated(message) {
      updateMessage(message);
    }

    function onUserTyping({ conversationId, userName, isTyping }) {
      setTyping(conversationId, userName, isTyping);
    }

    function onIncomingCall({ caller, signalData, callType, conversationId }) {
      receiveIncomingCall({ caller, signalData, callType, conversationId });
    }

    function onCallEnded() {
      endCallState();
    }

    function onConferenceParticipants(participants) {
      setConferenceParticipants(participants);
    }

    function onConferenceUserLeft({ userId }) {
      removeConferenceRemoteStream(userId);
    }

    function onConferenceNewMessage(msg) {
      addConferenceMessage(msg);
    }

    function onConferenceMediaUpdate({ userId, isMuted, isVideoOff, isScreenSharing }) {
      updateConferenceMedia({
        participants: useChatStore.getState().conferenceState.participants.map((p) =>
          p.userId === userId ? { ...p, isMuted, isVideoOff, isScreenSharing } : p
        ),
      });
    }

    function onConferenceHandStatus({ userId, handRaised }) {
      updateConferenceMedia({
        participants: useChatStore.getState().conferenceState.participants.map((p) =>
          p.userId === userId ? { ...p, handRaised } : p
        ),
      });
    }

    globalSocket.on("connect", onConnect);
    globalSocket.on("disconnect", onDisconnect);
    globalSocket.on("online_users", onOnlineUsers);
    globalSocket.on("new_message", onNewMessage);
    globalSocket.on("message_updated", onMessageUpdated);
    globalSocket.on("user_typing", onUserTyping);
    globalSocket.on("incoming_call", onIncomingCall);
    globalSocket.on("call_ended", onCallEnded);
    globalSocket.on("conference_participants_update", onConferenceParticipants);
    globalSocket.on("conference_user_left", onConferenceUserLeft);
    globalSocket.on("conference_new_message", onConferenceNewMessage);
    globalSocket.on("conference_user_media_updated", onConferenceMediaUpdate);
    globalSocket.on("conference_hand_status", onConferenceHandStatus);

    if (globalSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      // Keep socket open across layout components, only clean event handlers if unmounting whole app
    };
  }, [
    addMessage,
    updateMessage,
    setOnlineUsers,
    setTyping,
    receiveIncomingCall,
    endCallState,
    setConferenceParticipants,
    removeConferenceRemoteStream,
    addConferenceMessage,
    updateConferenceMedia,
  ]);

  const joinConversation = useCallback((conversationId) => {
    if (globalSocket && conversationId) {
      globalSocket.emit("join_conversation", { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (globalSocket && conversationId) {
      globalSocket.emit("leave_conversation", { conversationId });
    }
  }, []);

  const sendMessage = useCallback((data) => {
    return new Promise((resolve, reject) => {
      if (!globalSocket) return reject(new Error("Socket not connected"));
      globalSocket.emit("send_message", data, (res) => {
        if (res?.error) reject(new Error(res.error));
        else resolve(res?.message);
      });
    });
  }, []);

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (globalSocket) {
      globalSocket.emit("typing", { conversationId, isTyping });
    }
  }, []);

  const sendReaction = useCallback((messageId, emoji, conversationId) => {
    if (globalSocket) {
      globalSocket.emit("message_reaction", { messageId, emoji, conversationId });
    }
  }, []);

  return {
    socket: globalSocket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendReaction,
  };
}
