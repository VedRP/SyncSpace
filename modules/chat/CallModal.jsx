"use client";

import { useEffect, useRef, useState } from "react";
import useChatStore from "@/store/chatStore";
import useWebRTC from "@/hooks/useWebRTC";

export default function CallModal() {
  const { callState, setCallDuration } = useChatStore();
  const {
    answerIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  const {
    isOpen,
    isIncoming,
    isOutgoing,
    isConnected,
    callType,
    otherUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
  } = callState;

  // Call timer
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          setCallDuration(next);
          return next;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isConnected, setCallDuration]);

  // Bind local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isOpen]);

  // Bind remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isConnected]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const otherName = otherUser?.name || "Colleague";
  const initials = otherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-4xl h-[600px] bg-[#1b1a23] rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col overflow-hidden text-white">
        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-[#16151f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{otherName}</h2>
              <p className="text-xs text-gray-400">
                {isIncoming && !isConnected
                  ? `Incoming ${callType} call…`
                  : isOutgoing && !isConnected
                  ? `Calling ${otherName}…`
                  : `${callType === "video" ? "Video" : "Audio"} Call • ${formatTime(seconds)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {isConnected ? "Connected" : isIncoming ? "Ringing" : "Connecting"}
            </span>
          </div>
        </div>

        {/* Video / Call Display Area */}
        <div className="relative flex-1 bg-gradient-to-b from-[#111019] to-[#0a0910] flex items-center justify-center overflow-hidden">
          {/* Incoming Prompt View */}
          {isIncoming && !isConnected ? (
            <div className="text-center space-y-6 animate-pulse">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold shadow-2xl ring-8 ring-blue-500/20">
                {initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{otherName}</h3>
                <p className="text-sm text-gray-400 mt-1">is calling you with {callType}…</p>
              </div>
            </div>
          ) : isOutgoing && !isConnected ? (
            /* Outgoing Ringing View */
            <div className="text-center space-y-6">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-4xl font-bold shadow-2xl animate-bounce">
                {initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{otherName}</h3>
                <p className="text-sm text-gray-400 mt-1">Calling…</p>
              </div>
            </div>
          ) : (
            /* Active Connected Video Streams */
            <div className="relative w-full h-full flex items-center justify-center">
              {callType === "video" && remoteStream && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* If Audio-only or remote camera disabled */}
              {(callType === "audio" || !remoteStream) && (
                <div className="text-center space-y-4">
                  <div className="w-28 h-28 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold shadow-xl">
                    {initials}
                  </div>
                  <div className="text-lg font-semibold">{otherName}</div>
                  <div className="text-xs text-gray-400">Audio connected</div>
                </div>
              )}

              {/* Local PiP Video Preview */}
              {callType === "video" && (
                <div className="absolute bottom-4 right-4 w-44 h-32 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700/80">
                  {isCameraOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-xs text-gray-400">
                      <span>Camera Off</span>
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  )}
                  <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white font-medium">
                    You
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Controls (Teams Style) */}
        <div className="px-6 py-4 bg-[#16151f] border-t border-gray-800 flex items-center justify-center gap-4">
          {isIncoming && !isConnected ? (
            /* Incoming Actions */
            <>
              <button
                type="button"
                onClick={answerIncomingCall}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition duration-150 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Accept</span>
              </button>

              <button
                type="button"
                onClick={rejectIncomingCall}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition duration-150 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Decline</span>
              </button>
            </>
          ) : (
            /* Active Call Controls */
            <>
              {/* Mic Mute */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-3.5 rounded-full transition duration-150 ${
                  isMuted ? "bg-rose-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
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
              {callType === "video" && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-3.5 rounded-full transition duration-150 ${
                    isCameraOff ? "bg-rose-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                  title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
                >
                  {isCameraOff ? (
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
              )}

              {/* Screen Sharing (Teams feature) */}
              <button
                type="button"
                onClick={toggleScreenShare}
                className={`p-3.5 rounded-full transition duration-150 ${
                  isScreenSharing ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
                title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={endCall}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition duration-150 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                <span>End Call</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
