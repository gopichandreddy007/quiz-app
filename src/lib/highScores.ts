import type { Difficulty } from './types'

export type HighScore = {
  category: string
  difficulty: Difficulty
  score: number
  total: number
  percent: number
  date: string // ISO date
}

const STORAGE_KEY = 'quizmaster-high-scores'

// one best score for each category + difficulty
function keyOf(s: Pick<HighScore, 'category' | 'difficulty'>) {
  return `${s.category}|${s.difficulty}`
}

export function loadHighScores(): HighScore[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HighScore[]
  } catch {
    return []
  }
}

// a better percent wins; with the same percent, more questions wins
export function isBetter(a: HighScore, b: HighScore): boolean {
  return a.percent > b.percent || (a.percent === b.percent && a.total > b.total)
}

// returns the new list and whether this result is a new best
export function addScore(list: HighScore[], entry: HighScore): { list: HighScore[]; isNewBest: boolean } {
  const existing = list.find((s) => keyOf(s) === keyOf(entry))
  if (existing && !isBetter(entry, existing)) return { list, isNewBest: false }

  const others = list.filter((s) => keyOf(s) !== keyOf(entry))
  return { list: [...others, entry], isNewBest: true }
}

export function saveScore(entry: HighScore): boolean {
  const { list, isNewBest } = addScore(loadHighScores(), entry)
  if (isNewBest) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // storage full or blocked, the quiz still works
    }
  }
  return isNewBest
}

// best first
export function topScores(list: HighScore[], count = 5): HighScore[] {
  return [...list].sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0)).slice(0, count)
}
