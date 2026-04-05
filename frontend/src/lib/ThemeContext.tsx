import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
    accentColor: string;
    updateBranding: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem("app-theme");
        return (stored === "light" || stored === "dark") ? stored : "dark";
    });

    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem("org-accent-color") || "#2563eb";
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        root.style.colorScheme = theme;
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || hex.length < 7) return "";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const adjustBrightness = (hex: string, amount: number) => {
        if (!hex || hex.length < 7) return hex;
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.max(0, r + amount));
        g = Math.min(255, Math.max(0, g + amount));
        b = Math.min(255, Math.max(0, b + amount));
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const applyBranding = (color: string) => {
        const root = document.documentElement;
        const secondary = adjustBrightness(color, 40);
        root.style.setProperty('--accent-primary', color);
        root.style.setProperty('--accent-secondary', secondary);
        root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color}, ${secondary})`);
        root.style.setProperty('--accent-glow', hexToRgba(color, 0.15));
        root.style.setProperty('--accent-subtle', hexToRgba(color, 0.08));
        root.style.setProperty('--sidebar-active-indicator', color);
        localStorage.setItem("org-accent-color", color);
    };

    useEffect(() => {
        applyBranding(accentColor);
    }, [accentColor]);

    const updateBranding = (color: string) => {
        setAccentColor(color);
    };

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    const isDark = theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark, accentColor, updateBranding }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
