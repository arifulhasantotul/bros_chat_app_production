// external imports
const mongoose = require("mongoose");

// model schema
const peopleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    cloudinary_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// model create
const People = mongoose.model("People", peopleSchema);

// exports module
module.exports = People;
