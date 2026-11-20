import { describe, it, expect, vi, afterEach } from 'vitest'
import { shuffle, cleanCategoryName, buildQuestionsUrl, toQuestion, fetchQuestions, fetchCategories } from './api'
import type { QuizSettings } from './types'

const settings: QuizSettings = { categoryId: 18, difficulty: 'easy', amount: 10, secondsPerQuestion: 15 }

// pretend the server answered with `body`
function mockFetch(body: unknown, ok = true, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(body) }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shuffle', () => {
  it('keeps all items and does not change the original array', () => {
    const items = [1, 2, 3, 4, 5]
    const result = shuffle(items)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
    expect(items).toEqual([1, 2, 3, 4, 5])
  })

  it('gives a fixed order with a fixed random function', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a'])
  })
})

describe('cleanCategoryName', () => {
  it('removes the "Entertainment:" and "Science:" prefixes', () => {
    expect(cleanCategoryName('Entertainment: Video Games')).toBe('Video Games')
    expect(cleanCategoryName('Science: Computers')).toBe('Computers')
    expect(cleanCategoryName('History')).toBe('History')
  })
})

describe('buildQuestionsUrl', () => {
  it('includes category and difficulty when chosen', () => {
    const url = new URL(buildQuestionsUrl(settings))
    expect(url.searchParams.get('amount')).toBe('10')
    expect(url.searchParams.get('category')).toBe('18')
    expect(url.searchParams.get('difficulty')).toBe('easy')
    expect(url.searchParams.get('type')).toBe('multiple')
  })

  it('leaves them out for "any"', () => {
    const url = new URL(buildQuestionsUrl({ ...settings, categoryId: null, difficulty: 'any' }))
    expect(url.searchParams.has('category')).toBe(false)
    expect(url.searchParams.has('difficulty')).toBe(false)
  })
})

describe('toQuestion', () => {
  it('decodes the text and puts the correct answer among the options', () => {
    const q = toQuestion(
      {
        category: 'Science%3A%20Computers',
        difficulty: 'easy',
        question: 'What%20does%20%22CPU%22%20stand%20for%3F',
        correct_answer: 'Central%20Processing%20Unit',
        incorrect_answers: ['Computer%20Personal%20Unit', 'Central%20Process%20Unit', 'Central%20Processor%20Unit'],
      },
      0,
    )
    expect(q.text).toBe('What does "CPU" stand for?')
    expect(q.category).toBe('Computers')
    expect(q.correct).toBe('Central Processing Unit')
    expect(q.options).toHaveLength(4)
    expect(q.options).toContain('Central Processing Unit')
  })
})

describe('fetchQuestions', () => {
  it('returns questions when the api answers with code 0', async () => {
    mockFetch({
      response_code: 0,
      results: [{ category: 'History', difficulty: 'easy', question: 'Q%3F', correct_answer: 'A', incorrect_answers: ['B', 'C', 'D'] }],
    })
    const questions = await fetchQuestions(settings)
    expect(questions).toHaveLength(1)
    expect(questions[0].text).toBe('Q?')
  })

  it('explains when there are not enough questions', async () => {
    mockFetch({ response_code: 1, results: [] })
    await expect(fetchQuestions(settings)).rejects.toThrow(/aren't enough questions/)
  })

  it('explains when there are too many requests', async () => {
    mockFetch({ response_code: 5, results: [] })
    await expect(fetchQuestions(settings)).rejects.toThrow(/wait 5 seconds/)
  })

  it('explains http 429 (too many requests) the same way', async () => {
    mockFetch({}, false, 429)
    await expect(fetchQuestions(settings)).rejects.toThrow(/wait 5 seconds/)
  })

  it('throws on http errors', async () => {
    mockFetch({}, false, 500)
    await expect(fetchQuestions(settings)).rejects.toThrow('500')
  })
})

describe('fetchCategories', () => {
  it('cleans the names and sorts them A to Z', async () => {
    mockFetch({
      trivia_categories: [
        { id: 15, name: 'Entertainment: Video Games' },
        { id: 9, name: 'General Knowledge' },
        { id: 23, name: 'History' },
      ],
    })
    const categories = await fetchCategories()
    expect(categories.map((c) => c.name)).toEqual(['General Knowledge', 'History', 'Video Games'])
  })
})
