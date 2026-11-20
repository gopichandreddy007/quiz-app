export type Difficulty = 'any' | 'easy' | 'medium' | 'hard'

export type QuizSettings = {
  categoryId: number | null // null = any category
  difficulty: Difficulty
  amount: number
  secondsPerQuestion: number // 0 = no timer
}

export type Question = {
  id: string
  category: string
  difficulty: string
  text: string
  correct: string
  options: string[] // correct + wrong answers, shuffled
}

export type Category = {
  id: number
  name: string
}
