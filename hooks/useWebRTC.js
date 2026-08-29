"use client";

import { useRef, useCallback } from "react";
import useChatStore from "@/store/chatStore";
import { getSocket } from "./useSocket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function useWebRTC() {
  const pcRef = useRef(null);
  const conferencePeersRef = useRef(new Map()); // userId -> RTCPeerConnection

  const {
    callState,
    startOutgoingCall,
    setCallConnected,
    updateCallMedia,
    endCallState,
    joinConferenceRoom,
    addConferenceRemoteStream,
    removeConferenceRemoteStream,
    leaveConferenceState,
    updateConferenceMedia,
  } = useChatStore();

  /**
   * Helper: Request local audio and/or video stream
   */
  const getLocalMedia = useCallback(async (isVideo = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
      });
      return stream;
    } catch (err) {
      console.warn("Could not get media with requested video, falling back to audio-only:", err);
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return audioOnlyStream;
      } catch (audioErr) {
        console.error("Failed to acquire any media devices:", audioErr);
        throw audioErr;
      }
    }
  }, []);

  /**
   * Start an outgoing 1:1 call
   */
  const makeCall = useCallback(
    async ({ recipient, callType = "video", conversationId }) => {
      const socket = getSocket();
      if (!socket) throw new Error("Socket not initialized");

      const localStream = await getLocalMedia(callType === "video");
      startOutgoingCall({ otherUser: recipient, callType, conversationId, localStream });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setCallConnected(event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            to: recipient._id,
            candidate: event.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        recipientId: recipient._id,
        signalData: offer,
        callType,
        conversationId,
      });

      // Socket Listeners for this call
      function onCallAccepted({ signalData }) {
        if (pcRef.current && signalData) {
          pcRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
        }
      }

      function onIceCandidate({ candidate }) {
        if (pcRef.current && candidate) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        }
      }

      function onCallRejected({ reason }) {
        alert(`Call was declined (${reason || "Busy"})`);
        endCall();
      }

      socket.once("call_accepted", onCallAccepted);
      socket.on("ice_candidate", onIceCandidate);
      socket.once("call_rejected", onCallRejected);
    },
    [getLocalMedia, startOutgoingCall, setCallConnected]
  );

  /**
   * Answer an incoming 1:1 call
   */
  const answerIncomingCall = useCallback(async () => {
    const socket = getSocket();
    const state = useChatStore.getState().callState;
    if (!socket || !state.incomingSignal || !state.otherUser) return;

    const localStream = await getLocalMedia(state.callType === "video");
    updateCallMedia({ localStream });

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setCallConnected(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          to: state.otherUser._id,
          candidate: event.candidate,
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(state.incomingSignal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer_call", {
      to: state.otherUser._id,
      signalData: answer,
    });

    function onIceCandidate({ candidate }) {
      if (pcRef.current && candidate) {
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      }
    }

    socket.on("ice_candidate", onIceCandidate);
  }, [getLocalMedia, updateCallMedia, setCallConnected]);

  /**
   * Reject an incoming 1:1 call
   */
  const rejectIncomingCall = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().callState;
    if (socket && state.otherUser) {
      socket.emit("reject_call", { to: state.otherUser._id });
    }
    endCallState();
  }, [endCallState]);

  /**
   * End ongoing 1:1 call
   */
  const endCall = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().callState;

    if (socket && state.otherUser) {
      socket.emit("end_call", {
        to: state.otherUser._id,
        conversationId: state.conversationId,
        duration: state.duration,
        callType: state.callType,
      });
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    endCallState();
  }, [endCallState]);

  /**
   * Toggle 1:1 Mic Mute
   */
  const toggleMute = useCallback(() => {
    const state = useChatStore.getState().callState;
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        updateCallMedia({ isMuted: !audioTrack.enabled });
      }
    }
  }, [updateCallMedia]);

  /**
   * Toggle 1:1 Camera
   */
  const toggleCamera = useCallback(() => {
    const state = useChatStore.getState().callState;
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        updateCallMedia({ isCameraOff: !videoTrack.enabled });
      }
    }
  }, [updateCallMedia]);

  /**
   * Toggle 1:1 Screen Share
   */
  const toggleScreenShare = useCallback(async () => {
    const state = useChatStore.getState().callState;
    const pc = pcRef.current;
    if (!pc || !state.localStream) return;

    if (state.isScreenSharing) {
      // Revert to camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && camTrack) {
          await sender.replaceTrack(camTrack);
        }
        updateCallMedia({ isScreenSharing: false });
      } catch (err) {
        console.error("Failed to revert to camera track:", err);
      }
    } else {
      // Start screen share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
          updateCallMedia({ isScreenSharing: true });

          screenTrack.onended = async () => {
            // Revert when user stops sharing via browser UI
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const camTrack = camStream.getVideoTracks()[0];
            if (sender && camTrack) {
              await sender.replaceTrack(camTrack);
            }
            updateCallMedia({ isScreenSharing: false });
          };
        }
      } catch (err) {
        console.error("Screen share cancelled or failed:", err);
      }
    }
  }, [updateCallMedia]);

  // ========================================================
  // Multi-Party Conference Room WebRTC Handlers
  // ========================================================

  const createPeerForConference = useCallback(
    (targetUserId, roomId, localStream) => {
      const socket = getSocket();
      const pc = new RTCPeerConnection(ICE_SERVERS);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          addConferenceRemoteStream(targetUserId, event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("conference_signal", {
            roomId,
            toUserId: targetUserId,
            signalData: { type: "candidate", candidate: event.candidate },
          });
        }
      };

      conferencePeersRef.current.set(targetUserId, pc);
      return pc;
    },
    [addConferenceRemoteStream]
  );

  const startConference = useCallback(
    async ({ roomId, roomName }) => {
      const socket = getSocket();
      if (!socket) throw new Error("Socket not initialized");

      const localStream = await getLocalMedia(true);
      joinConferenceRoom({ roomId, roomName, localStream });

      socket.emit("join_conference", {
        roomId,
        userMetadata: { isMuted: false, isVideoOff: false },
      });

      // When joining, connect to existing users in room
      socket.on("conference_existing_users", async (existingUsers) => {
        for (const user of existingUsers) {
          const pc = createPeerForConference(user.userId, roomId, localStream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("conference_signal", {
            roomId,
            toUserId: user.userId,
            signalData: { type: "offer", sdp: offer },
          });
        }
      });

      // When another user signals us
      socket.on("conference_signal", async ({ fromUserId, signalData }) => {
        let pc = conferencePeersRef.current.get(fromUserId);

        if (!pc) {
          pc = createPeerForConference(fromUserId, roomId, localStream);
        }

        if (signalData.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("conference_signal", {
            roomId,
            toUserId: fromUserId,
            signalData: { type: "answer", sdp: answer },
          });
        } else if (signalData.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
        } else if (signalData.type === "candidate" && signalData.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate)).catch(console.error);
        }
      });
    },
    [getLocalMedia, joinConferenceRoom, createPeerForConference]
  );

  const leaveConference = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().conferenceState;

    if (socket && state.roomId) {
      socket.emit("leave_conference", { roomId: state.roomId });
    }

    conferencePeersRef.current.forEach((pc) => {
      pc.close();
    });
    conferencePeersRef.current.clear();

    leaveConferenceState();
  }, [leaveConferenceState]);

  const toggleConferenceMute = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().conferenceState;
    if (state.localStream) {
      const track = state.localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        const isMuted = !track.enabled;
        updateConferenceMedia({ isMuted });
        if (socket && state.roomId) {
          socket.emit("conference_toggle_media", { roomId: state.roomId, isMuted });
        }
      }
    }
  }, [updateConferenceMedia]);

  const toggleConferenceCamera = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().conferenceState;
    if (state.localStream) {
      const track = state.localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        const isVideoOff = !track.enabled;
        updateConferenceMedia({ isVideoOff });
        if (socket && state.roomId) {
          socket.emit("conference_toggle_media", { roomId: state.roomId, isVideoOff });
        }
      }
    }
  }, [updateConferenceMedia]);

  const toggleConferenceScreenShare = useCallback(async () => {
    const socket = getSocket();
    const state = useChatStore.getState().conferenceState;
    if (!state.localStream) return;

    if (state.isScreenSharing) {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        conferencePeersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender && camTrack) sender.replaceTrack(camTrack);
        });
        updateConferenceMedia({ isScreenSharing: false });
        if (socket && state.roomId) {
          socket.emit("conference_toggle_media", { roomId: state.roomId, isScreenSharing: false });
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        conferencePeersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender && screenTrack) sender.replaceTrack(screenTrack);
        });
        updateConferenceMedia({ isScreenSharing: true });
        if (socket && state.roomId) {
          socket.emit("conference_toggle_media", { roomId: state.roomId, isScreenSharing: true });
        }

        screenTrack.onended = async () => {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const camTrack = camStream.getVideoTracks()[0];
          conferencePeersRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
            if (sender && camTrack) sender.replaceTrack(camTrack);
          });
          updateConferenceMedia({ isScreenSharing: false });
          if (socket && state.roomId) {
            socket.emit("conference_toggle_media", { roomId: state.roomId, isScreenSharing: false });
          }
        };
      } catch (err) {
        console.error("Conference screen share error:", err);
      }
    }
  }, [updateConferenceMedia]);

  const toggleConferenceHand = useCallback(() => {
    const socket = getSocket();
    const state = useChatStore.getState().conferenceState;
    const nextStatus = !state.handRaised;
    updateConferenceMedia({ handRaised: nextStatus });
    if (socket && state.roomId) {
      socket.emit("conference_raise_hand", { roomId: state.roomId, handRaised: nextStatus });
    }
  }, [updateConferenceMedia]);

  return {
    makeCall,
    answerIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    startConference,
    leaveConference,
    toggleConferenceMute,
    toggleConferenceCamera,
    toggleConferenceScreenShare,
    toggleConferenceHand,
  };
}
