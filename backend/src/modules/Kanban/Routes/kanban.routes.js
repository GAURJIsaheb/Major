import { Router } from "express";
import VerifyMiddleware from "../../../middlewares/verify.middleware.js";
import KanbanController from "../Controllers/kanban.controller.js";

class KanbanRoutes {
  constructor() {
    this.router = Router();
    this.controller = new KanbanController();
  }

  routes() {
    this.router.get("/", VerifyMiddleware, this.controller.GetAll);
    this.router.post("/", VerifyMiddleware, this.controller.Create);
    this.router.patch("/:id", VerifyMiddleware, this.controller.Update);
    this.router.delete("/:id", VerifyMiddleware, this.controller.Delete);
    return this.router;
  }
}

export default KanbanRoutes;
