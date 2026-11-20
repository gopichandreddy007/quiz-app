import { describe, it, expect } from 'vitest'
import { addScore, topScores, saveScore, loadHighScores, type HighScore } from './highScores'

function entry(over: Partial<HighScore>): HighScore {
  return { category: 'History', difficulty: 'easy', score: 5, total: 10, percent: 50, date: '2026-11-20', ...over }
}

describe('addScore', () => {
  it('adds the first score for a category and difficulty', () => {
    const { list, isNewBest } = addScore([], entry({}))
    expect(list).toHaveLength(1)
    expect(isNewBest).toBe(true)
  })

  it('replaces a worse score', () => {
    const { list, isNewBest } = addScore([entry({ percent: 50 })], entry({ score: 8, percent: 80 }))
    expect(isNewBest).toBe(true)
    expect(list).toHaveLength(1)
    expect(list[0].percent).toBe(80)
  })

  it('keeps a better score', () => {
    const before = [entry({ percent: 90 })]
    const { list, isNewBest } = addScore(before, entry({ percent: 70 }))
    expect(isNewBest).toBe(false)
    expect(list).toBe(before)
  })

  it('with the same percent, the longer quiz wins', () => {
    const { isNewBest } = addScore([entry({ score: 5, total: 5, percent: 100 })], entry({ score: 10, total: 10, percent: 100 }))
    expect(isNewBest).toBe(true)
  })

  it('keeps different difficulties apart', () => {
    const { list } = addScore([entry({ difficulty: 'easy' })], entry({ difficulty: 'hard' }))
    expect(list).toHaveLength(2)
  })
})

describe('topScores', () => {
  it('sorts best first and limits the count', () => {
    const list = [entry({ category: 'A', percent: 40 }), entry({ category: 'B', percent: 90 }), entry({ category: 'C', percent: 70 })]
    expect(topScores(list, 2).map((s) => s.category)).toEqual(['B', 'C'])
  })
})

describe('saveScore', () => {
  it('saves to localStorage only when it is a new best', () => {
    expect(saveScore(entry({ percent: 60 }))).toBe(true)
    expect(saveScore(entry({ percent: 30 }))).toBe(false)
    expect(loadHighScores()).toHaveLength(1)
    expect(loadHighScores()[0].percent).toBe(60)
  })
})
