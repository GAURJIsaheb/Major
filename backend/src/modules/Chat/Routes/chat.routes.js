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
    this.router.get("/upload-url", VerifyMiddleware, this.controller.GetSignedUrl);
    this.router.post("/reactions", VerifyMiddleware, this.controller.ToggleReaction);
    return this.router;
  }
}

export default ChatRoutes;
