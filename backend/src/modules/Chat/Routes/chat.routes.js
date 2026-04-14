import { Router } from "express";
import VerifyMiddleware from "../../../middlewares/verify.middleware.js";
import ChatController from "../Controllers/chat.controller.js";

class ChatRoutes {
  constructor() {
    this.router = Router();
    this.controller = new ChatController();
  }

  routes() {
    this.router.get("/messages", VerifyMiddleware, this.controller.GetMessages);
    this.router.post("/messages", VerifyMiddleware, this.controller.SendMessage);
    return this.router;
  }
}

export default ChatRoutes;
