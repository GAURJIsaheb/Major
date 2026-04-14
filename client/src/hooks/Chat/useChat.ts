import { useState, useEffect, useRef, useCallback } from "react";
import ApiCaller from "@/utils/ApiCaller";
import { useAppSelector } from "@/store/hooks";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
}

export function useChat() {
  const { userDetails } = useAppSelector((s) => s.userState);
  const userId = userDetails?.id || (userDetails as any)?._id || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

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
          // Avoid duplicates
          if (prev.some((m) => m._id === data.payload._id)) return prev;
          return [...prev, data.payload];
        });
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

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);

    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "SEND_MESSAGE", payload: { text } }));
      setInputText("");
    } else {
      // Fallback to REST
      const res = await ApiCaller<{ text: string }, ChatMessage>({
        requestType: "POST",
        paths: ["api", "v1", "chat", "messages"],
        body: { text },
      });
      if (res.ok) {
        setInputText("");
        setMessages((prev) => [...prev, res.response.data as ChatMessage]);
      }
    }
    setSending(false);
  };

  return {
    messages,
    loading,
    connected,
    inputText,
    setInputText,
    sending,
    sendMessage,
    userId,
    userDetails,
  };
}
