// small helpers for the results screen

export function percent(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100)
}

// a message and emoji that match how well you did
export function verdict(pct: number): { emoji: string; title: string } {
  if (pct === 100) return { emoji: '🏆', title: 'Perfect score!' }
  if (pct >= 80) return { emoji: '🔥', title: 'Amazing!' }
  if (pct >= 60) return { emoji: '😎', title: 'Nice work!' }
  if (pct >= 40) return { emoji: '🙂', title: 'Not bad!' }
  return { emoji: '📚', title: 'Keep practicing!' }
}

// 83000 ms -> "1:23"
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
