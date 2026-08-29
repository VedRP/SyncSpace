"use client";

import { useEffect, useRef, useState } from "react";
import useChatStore from "@/store/chatStore";
import useWebRTC from "@/hooks/useWebRTC";
import { getSocket } from "@/hooks/useSocket";

function ParticipantTile({ participant, stream, isLocal = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const name = participant?.user?.name || "Participant";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isVideoOff = participant?.isVideoOff;
  const isMuted = participant?.isMuted;
  const handRaised = participant?.handRaised;

  return (
    <div className="relative w-full h-full min-h-[200px] bg-[#1a1926] rounded-2xl overflow-hidden border border-gray-700/60 shadow-lg flex items-center justify-center group transition-all duration-200">
      {/* Video Stream */}
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? "mirror" : ""}`}
        />
      ) : (
        /* Avatar Placeholder */
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-white/10">
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-200">{name}</span>
        </div>
      )}

      {/* Top badges: Hand Raised, Mic Mute */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {handRaised && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-md animate-bounce">
            ✋ Hand Raised
          </span>
        )}
        {isMuted && (
          <span className="p-1.5 rounded-full bg-rose-600/90 text-white text-xs shadow-md">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
            </svg>
          </span>
        )}
      </div>

      {/* Bottom Name Label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
        <span className="text-xs font-medium text-white">
          {name} {isLocal && "(You)"}
        </span>
      </div>
    </div>
  );
}

export default function ConferenceRoom() {
  const { conferenceState, toggleConferenceParticipants, toggleConferenceChat } = useChatStore();
  const {
    leaveConference,
    toggleConferenceMute,
    toggleConferenceCamera,
    toggleConferenceScreenShare,
    toggleConferenceHand,
  } = useWebRTC();

  const [chatDraft, setChatDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(0);
  const chatBottomRef = useRef(null);

  const {
    isOpen,
    roomId,
    roomName,
    participants,
    localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    isScreenSharing,
    handRaised,
    messages,
    showParticipantsList,
    showChat,
  } = conferenceState;

  // Meeting duration timer
  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll meeting chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!isOpen) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyRoomLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    const socket = getSocket();
    if (socket && roomId) {
      socket.emit("conference_message", {
        roomId,
        text: chatDraft.trim(),
      });
      setChatDraft("");
    }
  };

  // Local participant object
  const localParticipant = {
    userId: "local_user",
    user: { name: "You" },
    isMuted,
    isVideoOff,
    isScreenSharing,
    handRaised,
  };

  const remoteUsers = participants.filter((p) => p.userId !== "local_user");
  const totalCount = 1 + remoteUsers.length;

  // Grid layout column calculation
  const getGridColsClass = () => {
    if (totalCount === 1) return "grid-cols-1";
    if (totalCount === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalCount <= 4) return "grid-cols-2";
    if (totalCount <= 6) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f0e17] text-white select-none">
      {/* Top Conference Header */}
      <header className="h-16 px-6 bg-[#161524] border-b border-gray-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>{roomName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              {formatDuration(duration)} • {totalCount} {totalCount === 1 ? "participant" : "participants"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-xs font-medium transition duration-150"
            title="Copy Meeting ID"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>{copied ? "ID Copied!" : `ID: ${roomId}`}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Video Grid + Optional Side Drawer) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Tiles Grid */}
        <main className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#0f0e17] to-[#08070d] flex items-center justify-center">
          <div className={`w-full h-full max-w-7xl grid ${getGridColsClass()} gap-4 auto-rows-fr`}>
            {/* Local User Tile */}
            <ParticipantTile
              participant={localParticipant}
              stream={localStream}
              isLocal={true}
            />

            {/* Remote Participants */}
            {remoteUsers.map((p) => (
              <ParticipantTile
                key={p.userId}
                participant={p}
                stream={remoteStreams[p.userId]}
                isLocal={false}
              />
            ))}
          </div>
        </main>

        {/* Right Side Drawer: Participants List or In-Meeting Chat */}
        {(showParticipantsList || showChat) && (
          <aside className="w-80 bg-[#161524] border-l border-gray-800 flex flex-col z-20 animate-fadeIn">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {showParticipantsList ? `Participants (${totalCount})` : "Meeting Chat"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (showParticipantsList) toggleConferenceParticipants();
                  if (showChat) toggleConferenceChat();
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Participants View */}
            {showParticipantsList && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                      You
                    </div>
                    <div>
                      <div className="text-sm font-medium">You (Host)</div>
                      <div className="text-[11px] text-gray-400">
                        {isMuted ? "Muted" : "Active"} • {isVideoOff ? "Camera Off" : "Video"}
                      </div>
                    </div>
                  </div>
                  {handRaised && <span className="text-xs">✋</span>}
                </div>

                {remoteUsers.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between p-2 rounded-xl bg-gray-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                        {p.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{p.user?.name || "Participant"}</div>
                        <div className="text-[11px] text-gray-400">
                          {p.isMuted ? "Muted" : "Active"} • {p.isVideoOff ? "Camera Off" : "Video"}
                        </div>
                      </div>
                    </div>
                    {p.handRaised && <span className="text-xs">✋</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Meeting Chat View */}
            {showChat && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No messages yet in this meeting.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-semibold text-blue-400">{m.sender?.name || "Member"}</span>
                          <span>{m.time}</span>
                        </div>
                        <div className="bg-gray-800/90 text-sm text-gray-100 p-2.5 rounded-xl border border-gray-700/50">
                          {m.text}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendChat} className="p-3 border-t border-gray-800 bg-[#12111d] flex gap-2">
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder="Type meeting message…"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Teams Toolbar */}
      <footer className="h-20 bg-[#161524] border-t border-gray-800 px-6 flex items-center justify-between z-10">
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gray-400">SyncSpace Teams Meeting</span>
        </div>

        {/* Core Controls */}
        <div className="flex items-center gap-3">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleConferenceMute}
            className={`p-3 rounded-2xl font-medium transition duration-150 flex flex-col items-center gap-1 ${
              isMuted ? "bg-rose-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleConferenceCamera}
            className={`p-3 rounded-2xl font-medium transition duration-150 flex flex-col items-center gap-1 ${
              isVideoOff ? "bg-rose-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isVideoOff ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={toggleConferenceScreenShare}
            className={`p-3 rounded-2xl font-medium transition duration-150 flex flex-col items-center gap-1 ${
              isScreenSharing ? "bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Raise Hand (Teams feature) */}
          <button
            type="button"
            onClick={toggleConferenceHand}
            className={`p-3 rounded-2xl font-medium transition duration-150 flex flex-col items-center gap-1 ${
              handRaised ? "bg-amber-500 text-black font-bold" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title={handRaised ? "Lower Hand" : "Raise Hand"}
          >
            <span className="text-lg leading-none">✋</span>
          </button>

          <div className="h-8 w-[1px] bg-gray-700 mx-2" />

          {/* Participants Toggle */}
          <button
            type="button"
            onClick={toggleConferenceParticipants}
            className={`p-3 rounded-2xl font-medium transition duration-150 ${
              showParticipantsList ? "bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title="Toggle Participants"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          {/* Chat Toggle */}
          <button
            type="button"
            onClick={toggleConferenceChat}
            className={`p-3 rounded-2xl font-medium transition duration-150 ${
              showChat ? "bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            title="Toggle Meeting Chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Leave / End Button */}
        <div>
          <button
            type="button"
            onClick={leaveConference}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg transition duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
