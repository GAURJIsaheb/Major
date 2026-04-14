import MessageModel from "../Models/Message.model.js";
import { AsyncHandler, ApiResponse, ApiError } from "../../../utils/index.js";

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
        .populate("sender", "firstName lastName profileImage role"),
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
    const { text } = req.body;
    if (!text || !text.trim()) {
      throw new ApiError(400, "Message text is required");
    }

    const message = await this.repo.create({
      sender: req.user.id,
      text: text.trim(),
    });

    const populated = await message.populate("sender", "firstName lastName profileImage role");

    return res.status(201).json(new ApiResponse(201, populated, "Message sent"));
  });
}

export default ChatController;
