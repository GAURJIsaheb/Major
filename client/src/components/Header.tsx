import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useHeader } from "@/hooks/Header/useHeader"
import { CalendarDays, LogOut, Users, Bell } from "lucide-react"
import ThemeToggle from "./ThemeToggle"

function Header() {
    const { loggingOut, handleLogout } = useHeader();

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

                    {/* Theme Toggle — available to everyone */}
                    <ThemeToggle />

                    {/* Notification bell */}
                    <button className="relative flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                    </button>

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