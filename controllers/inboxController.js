/*
 * Title: Project Inbox Control
 * Description: Handling all inbox controller function
 * Author: MD ARIFUL HASAN
 * Date: 24/01/2022
 *
 */

// external imports
const createError = require("http-errors");

// internal imports
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const escape = require("../utilities/escape");
const cloudinary = require("../config/cloudinary");

// get inbox page
async function getInbox(req, res, next) {
  try {
    // userId is taking from checkLogin middleware
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userId },
        { "participant.id": req.user.userId },
      ],
    });
    // setting conversation data to res.local
    res.locals.data = conversations;

    // render inbox page
    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

// search user
async function searchUser(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace("+88", "");

  // using regex to create filter option
  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  try {
    if (searchQuery !== "") {
      const users = await User.find(
        {
          $or: [
            {
              name: name_search_regex,
            },
            {
              mobile: mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
        },
        "name avatar email"
      );

      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// search conversation
async function searchConversation(req, res, next) {
  const conversation = req.body.conversation;
  const searchQuery = conversation.replace("+88", "");

  // using regex to create filter option
  const name_search_regex = new RegExp(escape(searchQuery), "i");

  try {
    if (searchQuery !== "") {
      const conversations = await Conversation.find(
        {
          $or: [
            {
              "creator.name": name_search_regex,
              "participant.name": req.user.username,
            },
            {
              "creator.name": req.user.username,
              "participant.name": name_search_regex,
            },
          ],
        },
        "creator.name creator.avatar participant.name participant.avatar"
      );

      res.status(200).json(conversations);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// add conversation
async function addConversation(req, res, next) {
  try {
    const oldConversation = await Conversation.find({
      $or: [
        {
          "creator.email": req.user.email,
          "participant.email": req.body.email,
        },
        {
          "creator.email": req.body.email,
          "participant.email": req.user.email,
        },
      ],
    });

    if (oldConversation && oldConversation.length === 0) {
      const newConversation = new Conversation({
        creator: {
          id: req.user.userId,
          name: req.user.username,
          email: req.user.email,
          avatar: req.user.avatar || null,
        },
        participant: {
          id: req.body.id,
          name: req.body.participant,
          email: req.body.email,
          avatar: req.body.avatar || null,
        },
      });

      const result = await newConversation.save();
    } else {
      throw createError("Conversation already exists!");
    }

    res.status(200).json({
      message: "Creating conversation done!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// get messages of a conversation
async function getMessages(req, res, next) {
  try {
    // filter message
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createdAt");

    // get participant
    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );

    res.status(200).json({
      data: {
        messages: messages,
        participant,
      },
      user: req.user.userId,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occurred!",
        },
      },
    });
  }
}

// send new message
async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in database
      let attachments = null;

      const multipleUpload = async (path) =>
        await cloudinary.uploader.upload(path);

      // check for file upload
      if (req.files && req.files.length > 0) {
        attachments = [];

        for (const file of req.files) {
          const { path } = file;
          const newPath = await multipleUpload(path);
          attachments.push({
            attachment_file: newPath.secure_url,
            cloudinary_id: newPath.public_id,
          });
        }
      }

      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userId,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.avatar || null,
        },
        conversation_id: req.body.conversationId,
      });

      const result = await newMessage.save();

      // emit socket event
      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userId,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: result.date_time,
        },
      });

      res.status(200).json({
        message: "Successful!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: "message text or attachment is required!",
      },
    });
  }
}

// remove attachments
async function removeMsgAndAttachments(req, res, next) {
  try {
    const message = await Message.findById(req.params.id);
    const multipleDelete = async (public_id) =>
      await cloudinary.uploader.destroy(public_id);
    // check attachment file
    if (message.attachment) {
      const attachments = message.attachment;
      for (const attachment of attachments) {
        await multipleDelete(attachment.cloudinary_id);
      }
    }

    await message.remove();

    res.status(200).json({
      message: "Message removed Successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete message and attachments!",
        },
      },
    });
  }
}

// remove all messages
async function removeMessages(req, res, next) {
  try {
    // total matched messages number
    const messageCount = await Message.count({
      conversation_id: req.params.id,
    });

    // matched delete all models
    const message = await Message.deleteMany({
      conversation_id: req.params.id,
    });

    next();
  } catch {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete messages and attachments",
        },
      },
    });
  }
}

async function removeConversation(req, res, next) {
  try {
    const conversation = await Conversation.findByIdAndDelete({
      _id: req.params.id,
    });
    res.status(200).json({
      message: "Conversation deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete conversation",
        },
      },
    });
  }
}

// exports functions
module.exports = {
  getInbox,
  searchUser,
  searchConversation,
  addConversation,
  getMessages,
  sendMessage,
  removeMsgAndAttachments,
  removeMessages,
  removeConversation,
};
