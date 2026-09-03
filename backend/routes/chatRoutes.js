const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
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
} = require("../controllers/chatController");

router.use(protect);

router.get("/conversations", getConversations);
router.post("/conversations/direct", getOrCreateDirectConversation);
router.post("/conversations/group", createGroupConversation);
router.put("/conversations/:conversationId/pin", togglePinConversation);
router.put("/conversations/:conversationId/details", updateConversationDetails);
router.post("/conversations/:conversationId/participants", addParticipants);
router.delete("/conversations/:conversationId/participants/:participantId", removeParticipant);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.delete("/conversations/:conversationId/messages/:messageId", deleteMessage);
router.put("/conversations/:conversationId/messages/:messageId/star", toggleStarMessage);
router.get("/conversations/:conversationId/starred", getStarredMessages);
router.get("/messages/starred", getStarredMessages);
router.post("/messages/:messageId/react", addReaction);
router.get("/users", getUsers);

module.exports = router;
