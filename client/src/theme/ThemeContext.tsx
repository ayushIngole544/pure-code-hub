import { createContext, useContext, useState, ReactNode } from "react";

type ThemeContextType = {
  themeName: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState("vs-dark");

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  };

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 🔥 Hook
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}