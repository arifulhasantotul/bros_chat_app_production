// external imports
const mongoose = require("mongoose");

// conversation structure
const conversationSchema = mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
      email: String,
    },
    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
      email: String,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// conversation model
const Conversation = mongoose.model("Conversation", conversationSchema);

// export module
module.exports = Conversation;
