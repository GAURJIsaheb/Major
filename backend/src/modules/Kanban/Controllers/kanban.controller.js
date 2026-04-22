import KanbanTaskModel from "../Models/KanbanTask.model.js";
import { AsyncHandler, ApiResponse, ApiError } from "../../../utils/index.js";
import Types from "../../../types/index.js";

class KanbanController {
  constructor() {
    this.repo = KanbanTaskModel;
  }

  // GET all tasks — each user sees only their own tasks
  GetAll = AsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const filter = { createdBy: userId };

    const tasks = await this.repo
      .find(filter)
      .populate("createdBy", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
  });

  // POST create task — any authenticated user (self-only)
  Create = AsyncHandler(async (req, res) => {
    const { title, description, status, priority, image } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(Types.Errors.BadRequest)
        .json(new ApiResponse(Types.Errors.BadRequest, null, "Title is required"));
    }

    const task = await this.repo.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      image: image || null,
      createdBy: req.user.id,
    });

    const populated = await task.populate([
      { path: "createdBy", select: "firstName lastName profileImage" },
    ]);

    return res.status(201).json(new ApiResponse(201, populated, "Task created"));
  });

  // PATCH update task — owner-only (self kanban)
  Update = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await this.repo.findById(id);
    if (!task) {
      return res
        .status(Types.Errors.NotFound)
        .json(new ApiResponse(Types.Errors.NotFound, null, "Task not found"));
    }

    if (String(task.createdBy) !== String(userId)) {
      throw new ApiError(Types.Errors.Forbidden, "You can only update your own tasks");
    }

    const { title, description, status, priority, image } = req.body;
    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (image !== undefined) task.image = image;

    await task.save();

    const updated = await this.repo
      .findById(id)
      .populate("createdBy", "firstName lastName profileImage");

    return res.status(200).json(new ApiResponse(200, updated, "Task updated"));
  });

  // DELETE task — owner-only (self kanban)
  Delete = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const task = await this.repo.findById(id);
    if (!task) {
      return res
        .status(Types.Errors.NotFound)
        .json(new ApiResponse(Types.Errors.NotFound, null, "Task not found"));
    }
    if (String(task.createdBy) !== String(userId)) {
      throw new ApiError(Types.Errors.Forbidden, "You can only delete your own tasks");
    }

    const deleted = await this.repo.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(Types.Errors.NotFound)
        .json(new ApiResponse(Types.Errors.NotFound, null, "Task not found"));
    }

    return res.status(200).json(new ApiResponse(200, deleted, "Task deleted"));
  });
}

export default KanbanController;
