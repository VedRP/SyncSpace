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
} = require("../controllers/chatController");

router.use(protect);

router.get("/conversations", getConversations);
router.post("/conversations/direct", getOrCreateDirectConversation);
router.post("/conversations/group", createGroupConversation);
router.put("/conversations/:conversationId/pin", togglePinConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.post("/messages/:messageId/react", addReaction);
router.get("/users", getUsers);

module.exports = router;
