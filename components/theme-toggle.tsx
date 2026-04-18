"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8 opacity-0" />
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="w-8 h-8 rounded-lg bg-transparent border-border hover:bg-secondary/50 group"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.1rem] w-[1.1rem] transition-all group-hover:text-primary" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem] transition-all group-hover:text-primary" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
