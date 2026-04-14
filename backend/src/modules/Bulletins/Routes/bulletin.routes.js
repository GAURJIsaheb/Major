import { Router } from "express";
import VerifyMiddleware from "../../../middlewares/verify.middleware.js";
import BulletinController from "../Controllers/bulletin.controller.js";

class BulletinRoutes {
  constructor() {
    this.router = Router();
    this.controller = new BulletinController();
  }

  routes() {
    this.router.post("/", VerifyMiddleware, this.controller.Create);
    this.router.get("/active", VerifyMiddleware, this.controller.GetActive);
    this.router.delete("/:id", VerifyMiddleware, this.controller.Delete);
    return this.router;
  }
}

export default BulletinRoutes;
