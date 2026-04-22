import MessageModel from "../Models/Message.model.js";
import { AsyncHandler, ApiResponse, ApiError, GenerateUploadUrl } from "../../../utils/index.js";
import { v4 as uuidv4 } from "uuid";

class ChatController {
  constructor() {
    this.repo = MessageModel;
  }

  // GET /chat/messages?page=1&limit=50
  GetMessages = AsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.repo
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "firstName lastName profileImage role")
        .populate("reactions.users", "firstName lastName profileImage"),
      this.repo.countDocuments(),
    ]);

    // Return in chronological order for display
    const ordered = messages.reverse();

    return res.status(200).json(
      new ApiResponse(200, { messages: ordered, total, page, limit }, "Messages fetched")
    );
  });

  // POST /chat/messages  — REST fallback; WS is primary
  SendMessage = AsyncHandler(async (req, res) => {
    const { text, imageUrl } = req.body;
    if ((!text || !text.trim()) && !imageUrl) {
      throw new ApiError(400, "Message text or image is required");
    }

    const message = await this.repo.create({
      sender: req.user.id,
      text: text?.trim() || "",
      imageUrl: imageUrl || null,
    });

    const populated = await message
      .populate("sender", "firstName lastName profileImage role")
      .populate("reactions.users", "firstName lastName profileImage");

    return res.status(201).json(new ApiResponse(201, populated, "Message sent"));
  });

  // GET /chat/upload-url?fileName=x&contentType=image/jpeg
  GetSignedUrl = AsyncHandler(async (req, res) => {
    const { fileName, contentType } = req.query;
    if (!fileName || !contentType) {
      throw new ApiError(400, "fileName and contentType are required");
    }

    const ext = fileName.split(".").pop() || "jpg";
    const key = `chat-images/${uuidv4()}.${ext}`;

    const signedUrl = await GenerateUploadUrl(
      key,
      contentType,
      process.env.PROFILE_PHOTO_BUCKET,
    );

    // Build the final public (or CDN) URL for the uploaded file
    const bucket = process.env.PROFILE_PHOTO_BUCKET;
    const region = process.env.AWS_REGION || "us-east-1";
    const useLocalstack = process.env.S3_USE_LOCALSTACK === "true";
    const s3Endpoint = process.env.S3_ENDPOINT;

    let publicUrl;
    if (useLocalstack && s3Endpoint) {
      publicUrl = `${s3Endpoint}/${bucket}/${key}`;
    } else if (s3Endpoint) {
      publicUrl = `${s3Endpoint}/${bucket}/${key}`;
    } else {
      publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return res.status(200).json(new ApiResponse(200, { signedUrl, publicUrl, key }, "Signed URL generated"));
  });

  // POST /chat/reactions — REST fallback when WS is unavailable
  ToggleReaction = AsyncHandler(async (req, res) => {
    const { messageId, emoji, action } = req.body;
    if (!messageId || !emoji || !["add", "remove"].includes(action)) {
      throw new ApiError(400, "messageId, emoji, and action (add|remove) are required");
    }

    const userId = req.user.id;
    let updated;

    if (action === "add") {
      // Ensure emoji bucket exists
      await this.repo.updateOne(
        { _id: messageId, "reactions.emoji": { $ne: emoji } },
        { $push: { reactions: { emoji, users: [] } } }
      );
      updated = await this.repo.findOneAndUpdate(
        { _id: messageId, "reactions.emoji": emoji },
        { $addToSet: { "reactions.$.users": userId } },
        { new: true }
      ).populate("reactions.users", "firstName lastName profileImage");
    } else {
      await this.repo.updateOne(
        { _id: messageId, "reactions.emoji": emoji },
        { $pull: { "reactions.$.users": userId } }
      );
      updated = await this.repo.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { users: { $size: 0 } } } },
        { new: true }
      ).populate("reactions.users", "firstName lastName profileImage");
    }

    if (!updated) throw new ApiError(404, "Message not found");
    return res.status(200).json(new ApiResponse(200, { _id: updated._id, reactions: updated.reactions }, "Reaction updated"));
  });
}

export default ChatController;
