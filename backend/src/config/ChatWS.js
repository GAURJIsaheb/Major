import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import MessageModel from "../modules/Chat/Models/Message.model.js";
import { Cfg } from "./env.js";

// Set of connected clients: Map<ws, { userId, firstName, lastName, role, profileImage }>
const clients = new Map();

export function initChatWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", async (ws, req) => {
    // --- Auth: parse token from cookie or query string ---
    let decoded;
    try {
      const rawCookies = req.headers.cookie || "";
      const cookies = cookie.parse(rawCookies);
      const token =
        cookies.accessToken ||
        new URLSearchParams(req.url.split("?")[1] || "").get("token");

      if (!token) {
        ws.close(4001, "Unauthorized");
        return;
      }
      decoded = jwt.verify(token, Cfg.ACCESS_TOKEN_SECRET);
    } catch {
      ws.close(4001, "Unauthorized");
      return;
    }

    const userMeta = {
      userId: decoded.id,
      firstName: decoded.firstName || "",
      lastName: decoded.lastName || "",
      role: decoded.role || "",
      profileImage: decoded.profileImage || null,
    };

    clients.set(ws, userMeta);

    // Notify others: user joined
    broadcast(
      {
        type: "USER_JOINED",
        payload: {
          userId: userMeta.userId,
          name: `${userMeta.firstName} ${userMeta.lastName}`.trim(),
          role: userMeta.role,
        },
      },
      ws
    );

    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (data.type === "SEND_MESSAGE") {
        const text = (data.payload?.text || "").trim();
        const imageUrl = data.payload?.imageUrl || null;
        if (!text && !imageUrl) return;
        if (text.length > 2000) return;

        try {
          const msg = await MessageModel.create({
            sender: userMeta.userId,
            text,
            imageUrl,
          });

          const outbound = {
            type: "NEW_MESSAGE",
            payload: {
              _id: msg._id,
              text: msg.text,
              imageUrl: msg.imageUrl,
              reactions: msg.reactions,
              createdAt: msg.createdAt,
              sender: {
                _id: userMeta.userId,
                firstName: userMeta.firstName,
                lastName: userMeta.lastName,
                role: userMeta.role,
                profileImage: userMeta.profileImage,
              },
            },
          };

          // Broadcast to ALL including sender (for consistent state)
          broadcastAll(outbound);
        } catch (err) {
          console.error("WS: failed to save message", err);
        }
      }

      if (data.type === "PING") {
        ws.send(JSON.stringify({ type: "PONG" }));
      }

      if (data.type === "ADD_REACTION") {
        const { messageId, emoji } = data.payload;
        if (!messageId || !emoji) return;

        try {
          // Step 1: Atomically ensure the emoji bucket exists with this user in it.
          // $addToSet on a nested array element requires two passes:
          // First ensure the reaction sub-doc exists...
          await MessageModel.updateOne(
            { _id: messageId, "reactions.emoji": { $ne: emoji } },
            { $push: { reactions: { emoji, users: [] } } }
          );
          // Then atomically add the user to that bucket (idempotent with $addToSet).
          const updated = await MessageModel.findOneAndUpdate(
            { _id: messageId, "reactions.emoji": emoji },
            { $addToSet: { "reactions.$.users": userMeta.userId } },
            { new: true }
          ).populate("reactions.users", "firstName lastName profileImage");

          if (!updated) return;

          broadcastAll({
            type: "REACTION_UPDATED",
            payload: { _id: updated._id, reactions: updated.reactions },
          });
        } catch (err) {
          console.error("WS: failed to add reaction", err);
        }
      }

      if (data.type === "REMOVE_REACTION") {
        const { messageId, emoji } = data.payload;
        if (!messageId || !emoji) return;

        try {
          // Atomically pull the user from the emoji bucket.
          await MessageModel.updateOne(
            { _id: messageId, "reactions.emoji": emoji },
            { $pull: { "reactions.$.users": userMeta.userId } }
          );
          // Clean up empty emoji buckets and return populated doc.
          const updated = await MessageModel.findByIdAndUpdate(
            messageId,
            { $pull: { reactions: { users: { $size: 0 } } } },
            { new: true }
          ).populate("reactions.users", "firstName lastName profileImage");

          if (!updated) return;

          broadcastAll({
            type: "REACTION_UPDATED",
            payload: { _id: updated._id, reactions: updated.reactions },
          });
        } catch (err) {
          console.error("WS: failed to remove reaction", err);
        }
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  console.log("Chat WebSocket server initialized at /ws/chat");
  return wss;
}

function broadcastAll(payload) {
  const msg = JSON.stringify(payload);
  for (const [client] of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(msg);
    }
  }
}

function broadcast(payload, excludeWs) {
  const msg = JSON.stringify(payload);
  for (const [client] of clients) {
    if (client !== excludeWs && client.readyState === 1) {
      client.send(msg);
    }
  }
}
