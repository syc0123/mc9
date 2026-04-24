'use client'
import { useState, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialDark(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  const toggle = useCallback(() => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }, [dark])

  return (
    <button
      onClick={toggle}
      aria-label="테마 전환"
      className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted hover:bg-accent hover:text-foreground transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
