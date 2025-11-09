// frontend/src/lib/avatar.js
const COLORS = ['#2563eb', '#ec4899', '#f97316', '#10b981', '#6366f1']

const hashName = (name = '') => {
  let hash = 0
  const input = name.trim() || 'JP'
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const makeInitialAvatar = (name = '', { size = 100, radius = 28, color: forcedColor } = {}) => {
  const initials = (name || 'JP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'JP'

  const color = forcedColor || COLORS[hashName(name) % COLORS.length]
  const svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><rect width='${size}' height='${size}' rx='${radius}' fill='${color}'/><text x='50%' y='55%' font-size='${size * 0.42}' font-family='Inter, Arial, sans-serif' fill='white' font-weight='700' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const pickAvatarColor = (name = '') => COLORS[hashName(name) % COLORS.length]
