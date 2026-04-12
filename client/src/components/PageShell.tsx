import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface PageShellProps {
    icon: LucideIcon
    title: string
    subtitle?: string
    iconColor?: string   // e.g. "text-indigo-600 dark:text-indigo-400"
    iconBg?: string      // e.g. "bg-indigo-100 dark:bg-indigo-900/30"
    blobColor1?: string  // e.g. "bg-indigo-500/6"
    blobColor2?: string  // e.g. "bg-violet-500/4"
    actions?: React.ReactNode
    stats?: React.ReactNode
    children: React.ReactNode
    maxWidth?: string
}

/**
 * Consistent page layout shell used by every dashboard page.
 * Provides: animated entry, premium header card with decorative blobs,
 * optional stat cards row, and a content card.
 */
export default function PageShell({
    icon: Icon,
    title,
    subtitle,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    blobColor1 = "bg-primary/5",
    blobColor2 = "bg-primary/3",
    actions,
    stats,
    children,
    maxWidth = "max-w-7xl",
}: PageShellProps) {
    return (
        <div className={cn("w-full mx-auto flex flex-col gap-5 animate-slide-up-fade pb-8", maxWidth)}>
            {/* ── Header Card ── */}
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm px-6 py-6 sm:px-8 sm:py-7">
                {/* Decorative blobs */}
                <div className={cn("absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-70", blobColor1)} />
                <div className={cn("absolute bottom-0 left-0 w-52 h-52 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-60", blobColor2)} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <div className={cn("flex items-center justify-center w-12 h-12 rounded-2xl border border-current/10 shadow-sm shrink-0", iconBg)}>
                            <Icon className={cn("w-6 h-6", iconColor)} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">{title}</h1>
                            {subtitle && <p className="text-muted-foreground text-sm mt-0.5 font-medium">{subtitle}</p>}
                        </div>
                    </div>

                    {/* Actions slot */}
                    {actions && (
                        <div className="flex items-center gap-3 flex-wrap">
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Stats Row ── */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats}
                </div>
            )}

            {/* ── Content ── */}
            {children}
        </div>
    )
}

/* ─── Reusable StatCard ─── */
interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    iconColor: string
    iconBg: string
    borderClass?: string
}

export function StatCard({ icon: Icon, label, value, iconColor, iconBg, borderClass }: StatCardProps) {
    return (
        <div className={cn("bg-card rounded-2xl border border-border/50 shadow-sm card-hover overflow-hidden", borderClass)}>
            <div className="p-5 flex items-center gap-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground tracking-tight leading-none animate-pop-in">{value}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
                </div>
            </div>
        </div>
    )
}

/* ─── Reusable Content Card ─── */
interface ContentCardProps {
    children: React.ReactNode
    className?: string
}

export function ContentCard({ children, className }: ContentCardProps) {
    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden", className)}>
            {children}
        </div>
    )
}

/* ─── Reusable Loading State ─── */
interface LoadingStateProps {
    label?: string
    iconColor?: string
    iconBg?: string
}

export function LoadingState({ label = "Loading...", iconColor = "text-primary", iconBg = "bg-primary/10" }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-muted-foreground">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4", iconBg)}>
                <svg className={cn("w-7 h-7 animate-spin", iconColor)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
            <p className="text-sm font-medium animate-pulse">{label}</p>
        </div>
    )
}

/* ─── Reusable Pagination Footer ─── */
interface PaginationFooterProps {
    page: number
    totalPages: number
    total: number
    limit: number
    onPrev: () => void
    onNext: () => void
    unit?: string
}

export function PaginationFooter({ page, totalPages, total, limit, onPrev, onNext, unit = "items" }: PaginationFooterProps) {
    if (total === 0) return null
    return (
        <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span>
                {" "}–{" "}
                <span className="font-semibold text-foreground">{Math.min(page * limit, total)}</span>
                {" "}of{" "}
                <span className="font-semibold text-foreground">{total}</span> {unit}
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onPrev}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 h-8 rounded-lg border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                        <button key={p} onClick={() => { /* handled externally */ }}
                            className={cn(
                                "w-8 h-8 text-xs font-semibold rounded-lg transition-all",
                                p === page ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}>
                            {p}
                        </button>
                    )
                })}
                {totalPages > 5 && <span className="text-muted-foreground text-xs px-1">…</span>}
                <button
                    onClick={onNext}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 h-8 rounded-lg border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
