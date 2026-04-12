import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "claude";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    setTheme: () => {},
});

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.remove("dark", "claude");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "claude") root.classList.add("claude");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const stored = localStorage.getItem("nexushr-theme") as Theme | null;
            return stored ?? "light";
        } catch {
            return "light";
        }
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        try {
            localStorage.setItem("nexushr-theme", t);
        } catch { /* ignore */ }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
