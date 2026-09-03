const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Get all conversations for current user
 */
async function getConversations(req, res) {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, data: conversations });
  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to fetch conversations" } });
  }
}

/**
 * Get or create a 1:1 direct conversation between current user and target user
 */
async function getOrCreateDirectConversation(req, res) {
  try {
    const userId = req.user._id;
    const { recipientId } = req.body || {};

    if (!recipientId) {
      return res.status(400).json({ success: false, data: { message: "recipientId is required" } });
    }

    if (String(userId) === String(recipientId)) {
      return res.status(400).json({ success: false, data: { message: "Cannot start a chat with yourself" } });
    }

    const recipient = await User.findById(recipientId).select("name email");
    if (!recipient) {
      return res.status(404).json({ success: false, data: { message: "Recipient user not found" } });
    }

    // Find existing direct conversation with exactly both participants
    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [userId, recipientId],
        creator: userId,
      });

      conversation = await Conversation.findById(conversation._id).populate("participants", "name email");
    }

    return res.json({ success: true, data: conversation });
  } catch (err) {
    console.error("getOrCreateDirectConversation error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to get or create conversation" } });
  }
}

/**
 * Create a group conversation / channel
 */
async function createGroupConversation(req, res) {
  try {
    const userId = req.user._id;
    const { name, description, participantIds = [], type = "group" } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: { message: "Group name is required" } });
    }

    const uniqueParticipants = Array.from(new Set([String(userId), ...participantIds.map(String)]));

    const conversation = await Conversation.create({
      type: type === "channel" ? "channel" : "group",
      name: name.trim(),
      description: description ? description.trim() : "",
      participants: uniqueParticipants,
      creator: userId,
    });

    const populated = await Conversation.findById(conversation._id).populate("participants", "name email");

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createGroupConversation error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to create group conversation" } });
  }
}

/**
 * Get message history for a conversation
 */
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { search } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found or access denied" } });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const filter = { conversation: conversationId };
    if (search && search.trim()) {
      filter.text = { $regex: search.trim(), $options: "i" };
    }

    const messages = await Message.find(filter)
      .populate("sender", "name email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to fetch messages" } });
  }
}

/**
 * Send a message via REST endpoint (useful for fallback or attachments)
 */
async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { text, messageType = "text", attachments = [], replyTo, callInfo } = req.body || {};

    if (!text && (!attachments || attachments.length === 0) && messageType !== "call_log") {
      return res.status(400).json({ success: false, data: { message: "Message content cannot be empty" } });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found" } });
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
      });

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to send message" } });
  }
}

/**
 * List all users / employees for direct messaging & calls
 */
async function getUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("name email createdAt")
      .sort({ name: 1 })
      .lean();

    return res.json({ success: true, data: users });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to fetch employees" } });
  }
}

/**
 * Add or toggle emoji reaction on a message
 */
async function addReaction(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const { emoji } = req.body || {};

    if (!emoji) {
      return res.status(400).json({ success: false, data: { message: "Emoji is required" } });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, data: { message: "Message not found" } });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.emoji === emoji && String(r.user) === String(userId)
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, user: userId });
    }

    await message.save();

    const populated = await Message.findById(message._id).populate("sender", "name email");
    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("addReaction error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to update reaction" } });
  }
}

async function togglePinConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found" } });
    }

    conversation.pinned = !conversation.pinned;
    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("togglePinConversation error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to toggle pin state" } });
  }
}

async function deleteMessage(req, res) {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversationId,
    });

    if (!message) {
      return res.status(404).json({ success: false, data: { message: "Message not found" } });
    }

    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ success: false, data: { message: "Not authorized to delete this message" } });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.attachments = [];
    message.reactions = [];
    await message.save();

    const populated = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name email" },
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("deleteMessage error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to delete message" } });
  }
async function toggleStarMessage(req, res) {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversationId,
    });

    if (!message) {
      return res.status(404).json({ success: false, data: { message: "Message not found" } });
    }

    const starIndex = message.starredBy.findIndex((id) => String(id) === String(userId));
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
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("toggleStarMessage error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to toggle star message" } });
  }
}

async function getStarredMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const query = { starredBy: userId };
    if (conversationId) {
      query.conversation = conversationId;
    }

    const messages = await Message.find(query)
      .populate("sender", "name email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error("getStarredMessages error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to get starred messages" } });
  }
}

async function addParticipants(req, res) {
  try {
    const { conversationId } = req.params;
    const { participantIds = [] } = req.body || {};

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found" } });
    }

    const currentSet = new Set(conversation.participants.map(String));
    participantIds.forEach((id) => currentSet.add(String(id)));
    conversation.participants = Array.from(currentSet);

    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("addParticipants error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to add participants" } });
  }
}

async function removeParticipant(req, res) {
  try {
    const { conversationId, participantId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found" } });
    }

    conversation.participants = conversation.participants.filter(
      (p) => String(p) !== String(participantId)
    );

    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("removeParticipant error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to remove participant" } });
  }
}

async function updateConversationDetails(req, res) {
  try {
    const { conversationId } = req.params;
    const { name, description } = req.body || {};

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: "Conversation not found" } });
    }

    if (name) conversation.name = name.trim();
    if (typeof description === "string") conversation.description = description.trim();

    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email" },
      });

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("updateConversationDetails error:", err);
    return res.status(500).json({ success: false, data: { message: "Failed to update channel details" } });
  }
}

module.exports = {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  getUsers,
  addReaction,
  togglePinConversation,
  deleteMessage,
  toggleStarMessage,
  getStarredMessages,
  addParticipants,
  removeParticipant,
  updateConversationDetails,
};
