import type { Category, Question, QuizSettings } from './types'

// Open Trivia Database, free and no API key: https://opentdb.com/api_config.php
const BASE_URL = 'https://opentdb.com'

type RawQuestion = {
  category: string
  difficulty: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

type QuestionsResponse = {
  response_code: number
  results: RawQuestion[]
}

// the api explains problems with a number instead of an http error
const RESPONSE_MESSAGES: Record<number, string> = {
  1: "There aren't enough questions for this category and difficulty. Try fewer questions or another difficulty.",
  2: 'The quiz settings were not valid.',
  5: 'Too many requests. Please wait 5 seconds and try again.',
}

// Fisher-Yates shuffle. `random` can be swapped in tests to get a fixed order
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// "Entertainment: Video Games" -> "Video Games"
export function cleanCategoryName(name: string): string {
  return name.replace(/^(Entertainment|Science):\s*/, '')
}

export function buildQuestionsUrl(settings: QuizSettings): string {
  const params = new URLSearchParams({
    amount: String(settings.amount),
    type: 'multiple',
    // url encoding is easier to decode than the default html entities (&quot; &#039; ...)
    encode: 'url3986',
  })
  if (settings.categoryId !== null) params.set('category', String(settings.categoryId))
  if (settings.difficulty !== 'any') params.set('difficulty', settings.difficulty)
  return `${BASE_URL}/api.php?${params}`
}

export function toQuestion(raw: RawQuestion, index: number, random: () => number = Math.random): Question {
  const decode = decodeURIComponent
  const correct = decode(raw.correct_answer)
  return {
    id: `q${index}`,
    category: cleanCategoryName(decode(raw.category)),
    difficulty: decode(raw.difficulty),
    text: decode(raw.question),
    correct,
    options: shuffle([correct, ...raw.incorrect_answers.map(decode)], random),
  }
}

export async function fetchQuestions(settings: QuizSettings): Promise<Question[]> {
  const res = await fetch(buildQuestionsUrl(settings))
  // the api allows one request every 5 seconds. It can say so with http 429 or with response_code 5
  if (res.status === 429) throw new Error(RESPONSE_MESSAGES[5])
  if (!res.ok) throw new Error(`Could not load questions (${res.status})`)

  const data: QuestionsResponse = await res.json()
  if (data.response_code !== 0) {
    throw new Error(RESPONSE_MESSAGES[data.response_code] ?? 'Could not load questions.')
  }
  return data.results.map((raw, i) => toQuestion(raw, i))
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api_category.php`)
  if (!res.ok) throw new Error(`Could not load categories (${res.status})`)

  const data: { trivia_categories: Category[] } = await res.json()
  return data.trivia_categories
    .map((c) => ({ id: c.id, name: cleanCategoryName(c.name) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
