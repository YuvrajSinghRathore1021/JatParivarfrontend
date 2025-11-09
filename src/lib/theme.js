// frontend/src/lib/theme.js
export function toggleTheme(){
  const html = document.documentElement
  const isDark = html.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}
