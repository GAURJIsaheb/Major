import { useState, useEffect, useRef, useCallback } from "react";
import ApiCaller from "@/utils/ApiCaller";
import { useAppSelector } from "@/store/hooks";
import axios from "axios";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

export interface ChatMessage {
  _id: string;
  text: string;
  imageUrl?: string | null;
  createdAt: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
  reactions?: {
    emoji: string;
    users: (string | { _id: string; firstName: string; lastName: string; profileImage?: string })[];
  }[];
}

export function useChat() {
  const { userDetails } = useAppSelector((s) => s.userState);
  const userId = userDetails?.id || (userDetails as any)?._id || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmounted = useRef(false);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load history once
  const loadHistory = useCallback(async () => {
    setLoading(true);
    const res = await ApiCaller<null, { messages: ChatMessage[] }>({
      requestType: "GET",
      paths: ["api", "v1", "chat", "messages"],
      queryParams: { limit: "100" },
    });
    if (res.ok && res.response.data?.messages) {
      setMessages(res.response.data.messages);
    }
    setLoading(false);
  }, []);

  const connect = useCallback(() => {
    if (isUnmounted.current) return;
    if (wsRef.current && wsRef.current.readyState < 2) return; // already connecting/open

    const ws = new WebSocket(`${WS_BASE}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isUnmounted.current) setConnected(true);
      // Keepalive ping every 25s
      pingTimer.current = setInterval(() => {
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: "PING" }));
      }, 25000);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "NEW_MESSAGE") {
        setMessages((prev) => {
          // Avoid duplicates — normalise both sides to string
          if (prev.some((m) => String(m._id) === String(data.payload._id))) return prev;
          return [...prev, data.payload];
        });
      }

      if (data.type === "REACTION_UPDATED") {
        const { _id, reactions } = data.payload;
        // Normalise ObjectId → string before comparing
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg._id) === String(_id) ? { ...msg, reactions } : msg
          )
        );
      }
    };

    ws.onclose = () => {
      if (pingTimer.current) clearInterval(pingTimer.current);
      if (!isUnmounted.current) {
        setConnected(false);
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    loadHistory();
    connect();
    return () => {
      isUnmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
      wsRef.current?.close();
    };
  }, [loadHistory, connect]);

  /** Upload image → S3, returns the public URL or null on failure */
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const res = await ApiCaller<null, { signedUrl: string; publicUrl: string; key: string }>({
        requestType: "GET",
        paths: ["api", "v1", "chat", "upload-url"],
        queryParams: { fileName: file.name, contentType: file.type },
      });

      if (!res.ok) return null;

      const { signedUrl, publicUrl } = res.response.data;

      // PUT straight to S3 using the pre-signed URL (no auth headers)
      await axios.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
        withCredentials: false,
      });

      return publicUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (imageUrl?: string | null) => {
    const text = inputText.trim();
    if (!text && !imageUrl) return;
    if (sending) return;
    setSending(true);

    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          payload: { text, imageUrl: imageUrl || null },
        })
      );
      setInputText("");
    } else {
      // Fallback to REST
      const res = await ApiCaller<{ text: string; imageUrl?: string | null }, ChatMessage>({
        requestType: "POST",
        paths: ["api", "v1", "chat", "messages"],
        body: { text, imageUrl: imageUrl || null },
      });
      if (res.ok) {
        setInputText("");
        setMessages((prev) => [...prev, res.response.data as ChatMessage]);
      }
    }
    setSending(false);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    // Normalise messageId to string for safe comparisons
    const msgIdStr = String(messageId);

    // Find the message — use String() to safely compare ObjectId vs string
    const msg = messages.find((m) => String(m._id) === msgIdStr);
    if (!msg) return;

    const reaction = msg.reactions?.find((r) => r.emoji === emoji);
    const hasReacted = Boolean(
      reaction?.users.some((u: any) =>
        String(typeof u === "string" ? u : u._id) === String(userId)
      )
    );

    // ── 1. Optimistic update — always runs immediately, no WS required ──────
    setMessages((prev) =>
      prev.map((m) => {
        if (String(m._id) !== msgIdStr) return m;
        const fakeUser = { _id: userId, firstName: "", lastName: "" };
        let reactions = m.reactions ? [...m.reactions] : [];
        if (hasReacted) {
          reactions = reactions
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    users: r.users.filter(
                      (u: any) => String(typeof u === "string" ? u : u._id) !== String(userId)
                    ),
                  }
                : r
            )
            .filter((r) => r.users.length > 0);
        } else {
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            reactions = reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, users: [...r.users, fakeUser as any] }
                : r
            );
          } else {
            reactions = [...reactions, { emoji, users: [fakeUser as any] }];
          }
        }
        return { ...m, reactions };
      })
    );

    // ── 2. Persist via WebSocket (preferred) or REST fallback ───────────────
    const ws = wsRef.current;
    const eventType = hasReacted ? "REMOVE_REACTION" : "ADD_REACTION";

    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: eventType, payload: { messageId: msgIdStr, emoji } }));
    } else {
      // REST fallback so reaction is persisted even when WS is down
      ApiCaller({
        requestType: "POST",
        paths: ["api", "v1", "chat", "reactions"],
        body: { messageId: msgIdStr, emoji, action: hasReacted ? "remove" : "add" },
      }).catch(() => {/* silent — optimistic UI already updated */});
    }
  };

  return {
    messages,
    loading,
    connected,
    inputText,
    setInputText,
    sending,
    uploading,
    sendMessage,
    uploadImage,
    toggleReaction,
    userId,
    userDetails,
  };
}
