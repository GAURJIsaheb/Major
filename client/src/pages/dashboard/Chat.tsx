import { useEffect, useRef } from "react";
import { useChat, type ChatMessage } from "@/hooks/Chat/useChat";
import {
    MessageSquare,
    Send,
    Loader2,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Avatar({
    name,
    image,
    role,
}: {
    name: string;
    image?: string;
    role: string;
}) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const isHR = role?.toUpperCase() === "HR";

    return (
        <div
            className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden",
                isHR
                    ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-2 ring-violet-300 dark:ring-violet-700"
                    : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700"
            )}
        >
            {image ? (
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}

function MessageBubble({
    msg,
    isMine,
    showMeta,
}: {
    msg: ChatMessage;
    isMine: boolean;
    showMeta: boolean;
}) {
    const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`.trim();
    const isHR = msg.sender.role?.toUpperCase() === "HR";
    const time = new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={cn(
                "flex gap-2.5 items-end",
                isMine ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar — show only on first msg in group */}
            <div className="w-8 shrink-0">
                {showMeta && (
                    <Avatar
                        name={senderName}
                        image={msg.sender.profileImage}
                        role={msg.sender.role}
                    />
                )}
            </div>

            <div
                className={cn(
                    "flex flex-col gap-1 max-w-[70%]",
                    isMine ? "items-end" : "items-start"
                )}
            >
                {/* Sender name / role */}
                {showMeta && !isMine && (
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-xs font-semibold text-foreground/80">
                            {senderName}
                        </span>
                        <span
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                                isHR
                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            )}
                        >
                            {msg.sender.role}
                        </span>
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed wrap-break-words shadow-sm",
                        isMine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-card border border-border/60 text-foreground"
                    )}
                >
                    {msg.text}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground/70 px-1">
                    {time}
                </span>
            </div>
        </div>
    );
}

export default function Chat() {
    const {
        messages,
        loading,
        inputText,
        setInputText,
        sending,
        sendMessage,
        userId,
    } = useChat();

    const chatBodyRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        const container = chatBodyRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Group messages: show meta only when sender changes
    const shouldShowMeta = (idx: number) => {
        if (idx === 0) return true;
        return messages[idx].sender._id !== messages[idx - 1].sender._id;
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-0 animate-slide-up-fade h-[calc(100vh-10rem)]">
            {/* Header card */}
            <div className="relative overflow-hidden rounded-t-2xl bg-card px-6 py-5 shadow-sm border border-border/50 border-b-0">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/40">
                            <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                                Company Chat
                            </h1>
                            <p className="text-muted-foreground text-sm mt-0.5 font-medium flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                All Employees &amp; HR — One Channel
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Messages area */}
            <div
                ref={chatBodyRef}
                className="flex-1 overflow-y-auto bg-background/50 border border-border/50 border-t-0 border-b-0 px-4 py-6"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                        <span className="font-medium">Loading messages…</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="font-semibold text-base">No messages yet</p>
                        <p className="text-sm text-muted-foreground/70">
                            Be the first to say something!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {messages.map((msg, idx) => {
                            const isMine = msg.sender._id === userId;
                            return (
                                <MessageBubble
                                    key={msg._id}
                                    msg={msg}
                                    isMine={isMine}
                                    showMeta={shouldShowMeta(idx)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="rounded-b-2xl bg-card border border-border/50 border-t px-4 py-4 shadow-sm">
                <div className="flex gap-3 items-end">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition scrollbar-thin max-h-32 overflow-y-auto"
                        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={sending || !inputText.trim()}
                        className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0 font-medium",
                            sending || !inputText.trim()
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 hover:scale-105 active:scale-95"
                        )}
                        aria-label="Send message"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
