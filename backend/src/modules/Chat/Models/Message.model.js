import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
    },
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;
