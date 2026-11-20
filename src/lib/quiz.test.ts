import { describe, it, expect } from 'vitest'
import { quizReducer, startQuiz, score, currentQuestion, type QuizState } from './quiz'
import type { Question } from './types'

function makeQuestion(n: number): Question {
  return {
    id: `q${n}`,
    category: 'Test',
    difficulty: 'easy',
    text: `Question ${n}?`,
    correct: 'Right',
    options: ['Wrong 1', 'Right', 'Wrong 2', 'Wrong 3'],
  }
}

const questions = [makeQuestion(1), makeQuestion(2), makeQuestion(3)]

function play(state: QuizState, ...actions: Parameters<typeof quizReducer>[1][]) {
  return actions.reduce(quizReducer, state)
}

describe('quiz reducer', () => {
  it('starts on the first question', () => {
    const state = startQuiz(questions, 1000)
    expect(state.index).toBe(0)
    expect(state.status).toBe('answering')
    expect(currentQuestion(state).text).toBe('Question 1?')
  })

  it('records a correct answer and reveals it', () => {
    const state = quizReducer(startQuiz(questions, 0), { type: 'ANSWER', option: 'Right' })
    expect(state.status).toBe('revealed')
    expect(state.answers).toEqual([{ questionId: 'q1', selected: 'Right', isCorrect: true }])
    expect(score(state)).toBe(1)
  })

  it('records a wrong answer', () => {
    const state = quizReducer(startQuiz(questions, 0), { type: 'ANSWER', option: 'Wrong 2' })
    expect(state.answers[0].isCorrect).toBe(false)
    expect(score(state)).toBe(0)
  })

  it('only accepts one answer per question', () => {
    const state = play(startQuiz(questions, 0), { type: 'ANSWER', option: 'Wrong 1' }, { type: 'ANSWER', option: 'Right' })
    expect(state.answers).toHaveLength(1)
    expect(score(state)).toBe(0)
  })

  it('counts running out of time as wrong', () => {
    const state = quizReducer(startQuiz(questions, 0), { type: 'TIME_UP' })
    expect(state.answers[0]).toEqual({ questionId: 'q1', selected: null, isCorrect: false })
  })

  it('cannot go to the next question before answering', () => {
    const start = startQuiz(questions, 0)
    expect(quizReducer(start, { type: 'NEXT', now: 1 })).toBe(start)
  })

  it('finishes after the last question', () => {
    const state = play(
      startQuiz(questions, 0),
      { type: 'ANSWER', option: 'Right' },
      { type: 'NEXT', now: 1 },
      { type: 'ANSWER', option: 'Wrong 1' },
      { type: 'NEXT', now: 2 },
      { type: 'TIME_UP' },
      { type: 'NEXT', now: 9000 },
    )
    expect(state.status).toBe('finished')
    expect(state.finishedAt).toBe(9000)
    expect(score(state)).toBe(1)
    expect(state.answers.map((a) => a.selected)).toEqual(['Right', 'Wrong 1', null])
  })

  describe('50:50 lifeline', () => {
    it('hides two wrong answers and never the right one', () => {
      const state = quizReducer(startQuiz(questions, 0), { type: 'FIFTY_FIFTY' })
      expect(state.hidden).toHaveLength(2)
      expect(state.hidden).not.toContain('Right')
      expect(state.fiftyFiftyUsed).toBe(true)
    })

    it('can only be used once per quiz', () => {
      const once = quizReducer(startQuiz(questions, 0), { type: 'FIFTY_FIFTY' })
      const next = play(once, { type: 'ANSWER', option: 'Right' }, { type: 'NEXT', now: 1 })
      expect(next.hidden).toEqual([]) // cleared on the next question
      expect(quizReducer(next, { type: 'FIFTY_FIFTY' })).toBe(next)
    })

    it('ignores clicks on hidden options', () => {
      const state = quizReducer(startQuiz(questions, 0), { type: 'FIFTY_FIFTY' })
      const after = quizReducer(state, { type: 'ANSWER', option: state.hidden[0] })
      expect(after).toBe(state)
    })
  })
})
