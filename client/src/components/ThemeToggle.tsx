import { useTheme, type Theme } from "@/context/ThemeContext";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const themes: { value: Theme; icon: React.ElementType; label: string; activeClass: string }[] = [
    {
        value: "light",
        icon: Sun,
        label: "Light",
        activeClass: "bg-amber-100 text-amber-700 border-amber-300 shadow-sm shadow-amber-200/50",
    },
    {
        value: "dark",
        icon: Moon,
        label: "Dark",
        activeClass: "bg-slate-800 text-slate-100 border-slate-600 shadow-sm shadow-slate-900/50",
    },
    {
        value: "claude",
        icon: Sparkles,
        label: "Claude",
        activeClass: "bg-orange-100 text-orange-700 border-orange-300 shadow-sm shadow-orange-200/50",
    },
];

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/60 border border-border/50 backdrop-blur-sm">
            {themes.map(({ value, icon: Icon, label, activeClass }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    title={`${label} theme`}
                    className={cn(
                        "relative flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground transition-all duration-200",
                        theme === value
                            ? cn("border", activeClass)
                            : "hover:text-foreground hover:bg-muted"
                    )}
                >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="sr-only">{label}</span>
                </button>
            ))}
        </div>
    );
}
