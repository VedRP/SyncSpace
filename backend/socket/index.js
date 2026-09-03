const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Track online users: userId -> { sockets: Set(socketId), user: { _id, name, email }, status: 'available'|'in_call'|'away' }
  const onlineUsers = new Map();
  // Track conference rooms: roomId -> Map(userId -> { socketId, user, isMuted, isVideoOff, isScreenSharing, handRaised })
  const conferenceRooms = new Map();

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password").lean();
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = {
        _id: String(user._id),
        name: user.name,
        email: user.email,
      };
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  function broadcastOnlineUsers() {
    const list = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      user: data.user,
      status: data.status || "available",
    }));
    io.emit("online_users", list);
  }

  io.on("connection", (socket) => {
    const userId = socket.user._id;

    // Register user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, {
        sockets: new Set([socket.id]),
        user: socket.user,
        status: "available",
      });
    } else {
      onlineUsers.get(userId).sockets.add(socket.id);
    }

    broadcastOnlineUsers();

    // ----------------------------------------------------
    // User Status Update (Available / Busy / In Call / Away)
    // ----------------------------------------------------
    socket.on("set_status", ({ status }) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).status = status;
        broadcastOnlineUsers();
      }
    });

    // ----------------------------------------------------
    // Chat Rooms & Direct Messaging
    // ----------------------------------------------------
    socket.on("join_conversation", ({ conversationId }) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, text, attachments = [], messageType = "text", replyTo, callInfo } = data;

        if (!conversationId) {
          if (callback) callback({ error: "conversationId is required" });
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text ? String(text).trim() : "",
          messageType,
          attachments,
          replyTo: replyTo || null,
          callInfo: callInfo || undefined,
          readBy: [userId],
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate("sender", "name email")
          .populate({
            path: "replyTo",
            populate: { path: "sender", select: "name email" },
          })
          .lean();

        // Broadcast to all participants in this conversation
        io.to(`conversation_${conversationId}`).emit("new_message", populated);

        // Notify participants who might not have the chat window open
        const conv = await Conversation.findById(conversationId).select("participants").lean();
        if (conv && conv.participants) {
          conv.participants.forEach((pId) => {
            const pStr = String(pId);
            if (pStr !== userId && onlineUsers.has(pStr)) {
              onlineUsers.get(pStr).sockets.forEach((sId) => {
                io.to(sId).emit("conversation_update", {
                  conversationId,
                  lastMessage: populated,
                });
              });
            }
          });
        }

        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error("send_message socket error:", err);
        if (callback) callback({ error: "Failed to send message" });
      }
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on("message_reaction", async ({ messageId, emoji, conversationId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const idx = message.reactions.findIndex(
          (r) => r.emoji === emoji && String(r.user) === userId
        );

        if (idx > -1) {
          message.reactions.splice(idx, 1);
        } else {
          message.reactions.push({ emoji, user: userId });
        }

        await message.save();

        const populated = await Message.findById(message._id)
          .populate("sender", "name email")
          .lean();

        io.to(`conversation_${conversationId}`).emit("message_updated", populated);
      } catch (err) {
        console.error("message_reaction socket error:", err);
      }
    });

    socket.on("delete_message", async ({ messageId, conversationId }, callback) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });

        if (!message || String(message.sender) !== userId) {
          if (callback) callback({ error: "Cannot delete this message" });
          return;
        }

        message.isDeleted = true;
        message.text = "This message was deleted";
        message.attachments = [];
        message.reactions = [];
        await message.save();

        const populated = await Message.findById(message._id)
          .populate("sender", "name email")
          .lean();

        io.to(`conversation_${conversationId}`).emit("message_deleted", populated);

        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error("delete_message socket error:", err);
        if (callback) callback({ error: "Failed to delete message" });
      }
    });

    socket.on("star_message", async ({ messageId, conversationId }, callback) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });
        if (!message) return;

        const starIndex = message.starredBy.findIndex((id) => String(id) === userId);
        if (starIndex > -1) {
          message.starredBy.splice(starIndex, 1);
        } else {
          message.starredBy.push(userId);
        }

        await message.save();

        const populated = await Message.findById(message._id)
          .populate("sender", "name email")
          .populate({
            path: "replyTo",
            populate: { path: "sender", select: "name email" },
          })
          .lean();

        io.to(`conversation_${conversationId}`).emit("message_updated", populated);

        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error("star_message socket error:", err);
        if (callback) callback({ error: "Failed to star message" });
      }
    });

    // ----------------------------------------------------
    // 1:1 Audio & Video Calling (WebRTC Signaling)
    // ----------------------------------------------------
    socket.on("call_user", ({ recipientId, signalData, callType, conversationId }) => {
      const recipientData = onlineUsers.get(String(recipientId));
      if (recipientData && recipientData.sockets.size > 0) {
        recipientData.sockets.forEach((sId) => {
          io.to(sId).emit("incoming_call", {
            caller: socket.user,
            signalData,
            callType,
            conversationId,
          });
        });
      } else {
        socket.emit("call_failed", { reason: "User is offline or unavailable" });
      }
    });

    socket.on("answer_call", ({ to, signalData }) => {
      const callerData = onlineUsers.get(String(to));
      if (callerData) {
        callerData.sockets.forEach((sId) => {
          io.to(sId).emit("call_accepted", {
            signalData,
            from: socket.user,
          });
        });
      }
    });

    socket.on("reject_call", ({ to, reason }) => {
      const callerData = onlineUsers.get(String(to));
      if (callerData) {
        callerData.sockets.forEach((sId) => {
          io.to(sId).emit("call_rejected", {
            from: socket.user,
            reason: reason || "declined",
          });
        });
      }
    });

    socket.on("end_call", async ({ to, conversationId, duration, callType }) => {
      const targetData = onlineUsers.get(String(to));
      if (targetData) {
        targetData.sockets.forEach((sId) => {
          io.to(sId).emit("call_ended", {
            from: socket.user,
          });
        });
      }

      // Log the completed/missed call in conversation if ID is provided
      if (conversationId) {
        try {
          const logMessage = await Message.create({
            conversation: conversationId,
            sender: userId,
            text: `${callType === "video" ? "Video" : "Audio"} call ended (${duration || 0}s)`,
            messageType: "call_log",
            callInfo: {
              callType: callType || "audio",
              duration: duration || 0,
              status: duration > 0 ? "completed" : "missed",
            },
            readBy: [userId],
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: logMessage._id,
            updatedAt: new Date(),
          });

          const populated = await Message.findById(logMessage._id)
            .populate("sender", "name email")
            .lean();

          io.to(`conversation_${conversationId}`).emit("new_message", populated);
        } catch (e) {
          console.error("Failed to log call message:", e);
        }
      }
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      const targetData = onlineUsers.get(String(to));
      if (targetData) {
        targetData.sockets.forEach((sId) => {
          io.to(sId).emit("ice_candidate", {
            candidate,
            from: userId,
          });
        });
      }
    });

    // ----------------------------------------------------
    // Multi-Party Conference Room (Mesh WebRTC Calling)
    // ----------------------------------------------------
    socket.on("join_conference", ({ roomId, userMetadata }) => {
      const roomKey = String(roomId);
      socket.join(`conference_${roomKey}`);

      if (!conferenceRooms.has(roomKey)) {
        conferenceRooms.set(roomKey, new Map());
      }

      const room = conferenceRooms.get(roomKey);
      const participantInfo = {
        userId,
        socketId: socket.id,
        user: socket.user,
        isMuted: userMetadata?.isMuted || false,
        isVideoOff: userMetadata?.isVideoOff || false,
        isScreenSharing: false,
        handRaised: false,
        joinedAt: new Date(),
      };

      // Send existing participants in the room to new joiner
      const existingParticipants = Array.from(room.values()).filter((p) => p.userId !== userId);
      socket.emit("conference_existing_users", existingParticipants);

      // Add to room
      room.set(userId, participantInfo);

      // Notify others in room that new user joined
      socket.to(`conference_${roomKey}`).emit("conference_user_joined", participantInfo);

      // Broadcast updated participant list for conference
      io.to(`conference_${roomKey}`).emit("conference_participants_update", Array.from(room.values()));
    });

    socket.on("conference_signal", ({ toUserId, signalData, roomId }) => {
      const room = conferenceRooms.get(String(roomId));
      if (room && room.has(String(toUserId))) {
        const targetParticipant = room.get(String(toUserId));
        io.to(targetParticipant.socketId).emit("conference_signal", {
          fromUserId: userId,
          signalData,
        });
      }
    });

    socket.on("conference_toggle_media", ({ roomId, isMuted, isVideoOff, isScreenSharing }) => {
      const roomKey = String(roomId);
      const room = conferenceRooms.get(roomKey);
      if (room && room.has(userId)) {
        const participant = room.get(userId);
        if (typeof isMuted === "boolean") participant.isMuted = isMuted;
        if (typeof isVideoOff === "boolean") participant.isVideoOff = isVideoOff;
        if (typeof isScreenSharing === "boolean") participant.isScreenSharing = isScreenSharing;

        io.to(`conference_${roomKey}`).emit("conference_user_media_updated", {
          userId,
          isMuted: participant.isMuted,
          isVideoOff: participant.isVideoOff,
          isScreenSharing: participant.isScreenSharing,
        });
      }
    });

    socket.on("conference_raise_hand", ({ roomId, handRaised }) => {
      const roomKey = String(roomId);
      const room = conferenceRooms.get(roomKey);
      if (room && room.has(userId)) {
        const participant = room.get(userId);
        participant.handRaised = handRaised;

        io.to(`conference_${roomKey}`).emit("conference_hand_status", {
          userId,
          userName: socket.user.name,
          handRaised,
        });
      }
    });

    socket.on("conference_message", ({ roomId, text }) => {
      const roomKey = String(roomId);
      io.to(`conference_${roomKey}`).emit("conference_new_message", {
        id: `conf_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: socket.user,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: new Date().toISOString(),
      });
    });

    function handleLeaveConference(roomKey) {
      if (conferenceRooms.has(roomKey)) {
        const room = conferenceRooms.get(roomKey);
        if (room.has(userId)) {
          room.delete(userId);
          socket.to(`conference_${roomKey}`).emit("conference_user_left", { userId });
          io.to(`conference_${roomKey}`).emit("conference_participants_update", Array.from(room.values()));
        }
        if (room.size === 0) {
          conferenceRooms.delete(roomKey);
        }
      }
      socket.leave(`conference_${roomKey}`);
    }

    socket.on("leave_conference", ({ roomId }) => {
      handleLeaveConference(String(roomId));
    });

    // ----------------------------------------------------
    // Disconnect Handler
    // ----------------------------------------------------
    socket.on("disconnect", () => {
      if (onlineUsers.has(userId)) {
        const userEntry = onlineUsers.get(userId);
        userEntry.sockets.delete(socket.id);
        if (userEntry.sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      // Check all conference rooms for this user's socket
      conferenceRooms.forEach((room, roomKey) => {
        if (room.has(userId) && room.get(userId).socketId === socket.id) {
          handleLeaveConference(roomKey);
        }
      });

      broadcastOnlineUsers();
    });
  });

  return io;
}

module.exports = setupSocket;
