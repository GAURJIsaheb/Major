import { useEffect, useRef, useState } from "react";
import { useChat, type ChatMessage } from "@/hooks/Chat/useChat";
import {
    MessageSquare,
    Send,
    Loader2,
    Users,
    ImagePlus,
    X,
    SmilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Emoji reactions (quick-pick) ──────────────────────────────────────────────
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🙌", "🔥"];

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

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({
    msg,
    isMine,
    showMeta,
    userId,
    onToggleReaction,
}: {
    msg: ChatMessage;
    isMine: boolean;
    showMeta: boolean;
    userId: string;
    onToggleReaction: (messageId: string, emoji: string) => void;
}) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`.trim();
    const isHR = msg.sender.role?.toUpperCase() === "HR";
    const time = new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    // Close picker when clicking outside
    useEffect(() => {
        if (!showPicker) return;
        const handle = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [showPicker]);

    const handleReaction = (emoji: string) => {
        onToggleReaction(msg._id, emoji);
        setShowPicker(false);
    };

    return (
        <div
            className={cn(
                "group flex gap-2.5 items-end",
                isMine ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
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
                <div className="relative">
                    <div
                        className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden",
                            isMine
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-card border border-border/60 text-foreground"
                        )}
                    >
                        {/* Image attachment */}
                        {msg.imageUrl && (
                            <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={msg.imageUrl}
                                    alt="attachment"
                                    className="rounded-xl max-w-full max-h-60 object-cover mb-2 cursor-zoom-in hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </a>
                        )}

                        {/* Text */}
                        {msg.text && (
                            <span className="wrap-break-word">{msg.text}</span>
                        )}
                    </div>

                    {/* Reaction picker trigger */}
                    <button
                        onClick={(ev) => { ev.stopPropagation(); setShowPicker((v) => !v); }}
                        className={cn(
                            "absolute -bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-150",
                            "flex items-center justify-center w-7 h-7 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:scale-110",
                            isMine ? "-left-9" : "-right-9"
                        )}
                        aria-label="React"
                    >
                        <SmilePlus className="w-4 h-4" />
                    </button>

                    {/* Emoji picker — z-50 so it floats above scroll container */}
                    {showPicker && (
                        <div
                            ref={pickerRef}
                            className={cn(
                                "absolute z-50 flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1.5 shadow-xl",
                                isMine ? "right-0 bottom-full mb-2" : "left-0 bottom-full mb-2"
                            )}
                        >
                            {QUICK_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    onClick={(ev) => { ev.stopPropagation(); handleReaction(e); }}
                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent rounded-lg transition-all hover:scale-125 duration-100"
                                    title={e}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 px-1", isMine && "justify-end")}>
                        {msg.reactions.map((r) => {
                            // Normalise: server sends populated objects {_id, firstName, lastName}
                            // but REST history may still have plain string IDs — handle both.
                            const getUserId = (u: any): string =>
                                typeof u === "string" ? u : u._id;
                            const getUserName = (u: any): string =>
                                typeof u === "string"
                                    ? u
                                    : `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();

                            const hasReacted = r.users.some(
                                (u: any) => getUserId(u) === userId
                            );
                            const names = r.users
                                .map((u: any) => getUserName(u))
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => handleReaction(r.emoji)}
                                    title={names || undefined}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border",
                                        hasReacted
                                            ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                                            : "bg-accent border-border/50 text-muted-foreground hover:bg-accent/80"
                                    )}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-medium">{r.users.length}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground/70 px-1">{time}</span>
            </div>
        </div>
    );
}

// ── Main Chat page ────────────────────────────────────────────────────────────
export default function Chat() {
    const {
        messages,
        loading,
        inputText,
        setInputText,
        sending,
        uploading,
        sendMessage,
        uploadImage,
        toggleReaction,
        userId,
    } = useChat();

    const chatBodyRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        const container = chatBodyRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type & size (max 5 MB)
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB");
            return;
        }

        setPendingImage(file);
        setPendingImagePreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removePendingImage = () => {
        if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
        setPendingImage(null);
        setPendingImagePreview(null);
    };

    const handleSend = async () => {
        if (sending || uploading) return;
        if (!inputText.trim() && !pendingImage) return;

        let imageUrl: string | null = null;

        if (pendingImage) {
            imageUrl = await uploadImage(pendingImage);
            if (imageUrl === null) {
                toast.error("Image upload failed. Try again.");
                return;
            }
            removePendingImage();
        }

        sendMessage(imageUrl);
    };

    // Group messages: show meta only when sender changes
    const shouldShowMeta = (idx: number) => {
        if (idx === 0) return true;
        return messages[idx].sender._id !== messages[idx - 1].sender._id;
    };

    const isBusy = sending || uploading;

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
                                    userId={userId}
                                    onToggleReaction={toggleReaction}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="rounded-b-2xl bg-card border border-border/50 border-t px-4 py-4 shadow-sm">
                {/* Image preview strip */}
                {pendingImagePreview && (
                    <div className="mb-3 flex items-start gap-2">
                        <div className="relative inline-block">
                            <img
                                src={pendingImagePreview}
                                alt="preview"
                                className="h-20 w-28 object-cover rounded-xl border border-border shadow-sm"
                            />
                            <button
                                onClick={removePendingImage}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                aria-label="Remove image"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <span className="text-xs text-muted-foreground mt-2">
                            {pendingImage?.name}
                        </span>
                    </div>
                )}

                <div className="flex gap-3 items-end">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        id="chat-image-input"
                    />

                    {/* Image attach button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBusy}
                        title="Attach image"
                        className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-xl border border-border/60 shrink-0 transition-all duration-200",
                            pendingImage
                                ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                            isBusy && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label="Attach image"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ImagePlus className="w-4 h-4" />
                        )}
                    </button>

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
                        onClick={handleSend}
                        disabled={isBusy || (!inputText.trim() && !pendingImage)}
                        className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0 font-medium",
                            isBusy || (!inputText.trim() && !pendingImage)
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 hover:scale-105 active:scale-95"
                        )}
                        aria-label="Send message"
                    >
                        {isBusy ? (
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
