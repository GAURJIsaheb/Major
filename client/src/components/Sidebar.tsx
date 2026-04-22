import { Link, useLocation } from "react-router-dom"
import { useSidebar } from "@/hooks/Sidebar/useSidebar"
import {
    Users, CalendarCheck, CalendarDays, CalendarRange,
    Building2, BadgeDollarSign, Award, Banknote,
    Package, BriefcaseBusiness, ClipboardList, Shield,
    ChevronRight, Megaphone, MessageSquare, LayoutDashboard, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"

const iconMap: Record<string, LucideIcon> = {
    Users, CalendarCheck, CalendarDays, CalendarRange,
    Building2, BadgeCommon: BadgeDollarSign, Award, Banknote,
    Package, BriefcaseBusiness, ClipboardList, Shield,
    Megaphone, MessageSquare, LayoutDashboard,
}

const roleStyles: Record<string, { pill: string; dot: string; avatar: string }> = {
    HR: {
        pill: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-700/50",
        dot: "bg-violet-500",
        avatar: "bg-gradient-to-br from-violet-500 to-indigo-600",
    },
    EMPLOYEE: {
        pill: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/50",
        dot: "bg-indigo-500",
        avatar: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
}

export default function Sidebar() {
    const { role, items } = useSidebar()
    const location = useLocation()
    const { userDetails } = useAppSelector((state) => state.userState)

    const rs = roleStyles[role?.toUpperCase() ?? ""] ?? {
        pill: "bg-muted text-muted-foreground ring-1 ring-border",
        dot: "bg-muted-foreground",
        avatar: "bg-gradient-to-br from-slate-400 to-slate-600",
    }

    const firstName = userDetails?.firstName || ""
    const lastName = userDetails?.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim() || "User"
    const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "U"
    const profileImage = (userDetails as any)?.profileImage as string | undefined

    return (
        <aside className="w-64 hidden md:flex flex-col shrink-0 relative z-20 overflow-hidden" style={{ borderRight: "1px solid var(--sidebar-border)" }}>
            {/* Sidebar background */}
            <div className="absolute inset-0 bg-sidebar" />

            {/* Ambient orbs */}
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-40" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", opacity: 0.06 }} />
            <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none translate-x-1/4 translate-y-1/4" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", opacity: 0.04 }} />

            <div className="relative flex flex-col flex-1 overflow-hidden">
                {/* ── User profile card ── */}
                <div className="px-4 pt-5 pb-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent/40 border border-border/40 backdrop-blur-sm">
                        {/* Avatar */}
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-md", rs.avatar)}>
                            {profileImage ? (
                                <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>

                        {/* Name + role */}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground truncate leading-tight">{fullName}</p>
                            {role && (
                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1", rs.pill)}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", rs.dot)} />
                                    {role}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mx-4 h-px bg-border/50" />

                {/* Nav */}
                <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
                    <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">
                        Navigation
                    </p>

                    {items.map((item) => {
                        const isActive = location.pathname.startsWith(item.path)
                        const Icon = iconMap[item.icon]
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-accent/50"
                                )}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-foreground/40 rounded-r-full" />
                                )}

                                {Icon && (
                                    <Icon className={cn(
                                        "w-4 h-4 shrink-0 transition-all duration-200",
                                        isActive
                                            ? "text-primary-foreground"
                                            : "text-muted-foreground group-hover:text-sidebar-foreground group-hover:scale-110"
                                    )} />
                                )}

                                <span className={cn("flex-1 truncate", isActive && "font-semibold")}>
                                    {item.name}
                                </span>

                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/60 shrink-0" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom brand strip */}
                <div className="px-4 py-4 border-t border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">NexusHR</p>
                            <p className="text-[10px] text-muted-foreground">Human Capital Platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
