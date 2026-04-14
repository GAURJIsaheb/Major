import BulletinModel from "../Models/Bulletin.model.js";
import Types from "../../../types/index.js";
import { AsyncHandler, ApiResponse, ApiError } from "../../../utils/index.js";

class BulletinController {
  constructor() {
    this.repo = BulletinModel;
  }

  // HR creates a bulletin — auto-expires in 24 hours
  Create = AsyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "HR") {
      throw new ApiError(Types.Errors.Forbidden, "Only HR can create bulletins");
    }

    const { title, message } = req.body;

    if (!title || !title.trim()) {
      return res.status(Types.Errors.BadRequest).json(
        new ApiResponse(Types.Errors.BadRequest, null, "Title is required")
      );
    }
    if (!message || !message.trim()) {
      return res.status(Types.Errors.BadRequest).json(
        new ApiResponse(Types.Errors.BadRequest, null, "Message is required")
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

    const bulletin = await this.repo.create({
      title: title.trim(),
      message: message.trim(),
      createdBy: req.user.id,
      expiresAt,
    });

    return res.status(201).json(new ApiResponse(201, bulletin, "Bulletin created successfully"));
  });

  // Get all active bulletins (not yet expired)
  GetActive = AsyncHandler(async (req, res) => {
    const now = new Date();
    const bulletins = await this.repo
      .find({ expiresAt: { $gt: now }, isActive: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName");

    return res.status(200).json(new ApiResponse(200, bulletins, "Active bulletins fetched"));
  });

  // HR deletes a bulletin
  Delete = AsyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "HR") {
      throw new ApiError(Types.Errors.Forbidden, "Only HR can delete bulletins");
    }

    const { id } = req.params;
    const deleted = await this.repo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(Types.Errors.NotFound).json(
        new ApiResponse(Types.Errors.NotFound, null, "Bulletin not found")
      );
    }

    return res.status(200).json(new ApiResponse(200, deleted, "Bulletin deleted successfully"));
  });
}

export default BulletinController;
