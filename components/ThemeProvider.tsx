"use client"

import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "light",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "light" to match SSR — synced from DOM after hydration
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    // The layout inline script already applied the correct class + data-attr to <html>
    // before React hydrated, so reading from the DOM is the single source of truth.
    const current = (document.documentElement.getAttribute("data-cn-theme") as Theme) || "light"
    setThemeState(current)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    document.documentElement.setAttribute("data-cn-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
