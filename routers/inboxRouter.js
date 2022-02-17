/*
 * Title: Project Inbox Router
 * Description: Handling inbox routing
 * Author: MD ARIFUL HASAN
 * Date: 23/01/2022
 *
 */

// external imports
const express = require("express");

// internal imports
const {
  getInbox,
  searchUser,
  addConversation,
  sendMessage,
  getMessages,
  removeMsgAndAttachments,
  removeMessages,
  removeConversation,
  searchConversation,
} = require("../controllers/inboxController");
const { checkLogin } = require("../middlewares/common/checkLogin");
const decorateHTMLResponse = require("../middlewares/common/decorateHTMLResponse");
const attachmentUpload = require("../middlewares/Inbox/attachmentUpload");

const router = express.Router();

// GET: inbox page
router.get("/", decorateHTMLResponse("Inbox"), checkLogin, getInbox);

// POST: search user for conversation
router.post("/search", checkLogin, searchUser);

// POST: add conversation
router.post("/conversation", checkLogin, addConversation);

// POST: search conversation
router.post("/search/conversation", checkLogin, searchConversation);

// GET: messages of a conversation
router.get("/messages/:conversation_id", checkLogin, getMessages);

// POST: send message
router.post("/message", checkLogin, attachmentUpload, sendMessage);

// DELETE: message
router.delete("/msg/:id", checkLogin, removeMsgAndAttachments);

// DELETE: conversation
router.delete(
  "/conversation/:id",
  checkLogin,
  removeMessages,
  removeConversation
);

// module export
module.exports = router;
