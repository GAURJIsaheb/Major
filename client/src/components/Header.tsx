import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useHeader } from "@/hooks/Header/useHeader"
import { useBulletins } from "@/hooks/Bulletins/useBulletins"
import { CalendarDays, LogOut, Users, Bell, Megaphone, Clock, X, CheckCheck } from "lucide-react"
import ThemeToggle from "./ThemeToggle"
import { cn } from "@/lib/utils"

function timeLeft(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return "Expired"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h === 0) return `${m}m left`
    return `${h}h ${m}m left`
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
    const { visible, dismiss } = useBulletins()

    return (
        <div className="absolute top-full right-0 mt-2 w-96 z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Panel */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/10 overflow-hidden backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        <span className="font-bold text-sm text-foreground">Bulletins</span>
                        {visible.length > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                {visible.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[420px] overflow-y-auto">
                    {visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-muted-foreground">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <CheckCheck className="w-7 h-7 text-muted-foreground/40" />
                            </div>
                            <p className="font-semibold text-sm">All caught up!</p>
                            <p className="text-xs text-muted-foreground/70 text-center">
                                No active bulletins right now.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {visible.map((b) => (
                                <div
                                    key={b._id}
                                    className="group relative flex gap-3 px-5 py-4 hover:bg-accent/40 transition-colors"
                                >
                                    {/* Accent line */}
                                    <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-500" />

                                    {/* Icon */}
                                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <Megaphone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className="font-semibold text-sm text-foreground leading-snug truncate">
                                            {b.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                            {b.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <Clock className="w-3 h-3 text-amber-500" />
                                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                {timeLeft(b.expiresAt)}
                                            </span>
                                            {b.createdBy && (
                                                <>
                                                    <span className="text-muted-foreground/40 text-[11px] mx-1">·</span>
                                                    <span className="text-[11px] text-muted-foreground/70">
                                                        {b.createdBy.firstName} {b.createdBy.lastName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dismiss */}
                                    <button
                                        onClick={() => dismiss(b._id)}
                                        className="absolute top-3 right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                        aria-label="Dismiss"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
                    <a
                        href="/bulletins"
                        onClick={onClose}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        View all bulletins →
                    </a>
                </div>
            </div>
        </div>
    )
}

function Header() {
    const { loggingOut, handleLogout } = useHeader()
    const { visible } = useBulletins()
    const [notifOpen, setNotifOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!notifOpen) return
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setNotifOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [notifOpen])

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Glass layer */}
            <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-sm" />

            <div className="relative flex h-16 items-center justify-between px-4 lg:px-7 gap-3">
                {/* Brand */}
                <div className="flex items-center gap-3 select-none shrink-0">
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-all duration-200 hover:scale-105">
                        <Users className="w-[18px] h-[18px]" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-[17px] font-extrabold tracking-tight text-foreground leading-none">NexusHR</h1>
                        <p className="text-[10px] text-muted-foreground leading-none mt-0.5 font-medium">Human Capital Platform</p>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Date chip */}
                    <div className="hidden md:flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5 text-primary/60" />
                        <span>
                            {new Date().toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification bell — opens bulletin panel */}
                    <div className="relative" ref={panelRef}>
                        <button
                            id="notification-bell-btn"
                            onClick={() => setNotifOpen((v) => !v)}
                            className={cn(
                                "relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200",
                                notifOpen
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            {visible.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
                            )}
                        </button>

                        {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                    </div>

                    <Separator orientation="vertical" className="!h-6 hidden sm:block mx-1 bg-border/50" />

                    <Button
                        id="logout-btn"
                        variant="ghost"
                        size="sm"
                        disabled={loggingOut}
                        onClick={handleLogout}
                        className="gap-2 h-9 px-3 sm:px-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full font-medium transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">
                            {loggingOut ? "Logging out…" : "Logout"}
                        </span>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Header