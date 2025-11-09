// frontend/src/components/ThemeToggle.jsx
import { toggleTheme } from '../lib/theme'
export default function ThemeToggle(){
  const isDark = document.documentElement.classList.contains('dark')
  return (
    <button
      onClick={toggleTheme}
      className="px-3 h-9 rounded-lg border border-slate-200/70 dark:border-slate-700 bg-(--surface-2) text-(--text) hover:bg-(--card) transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
