import { shuffle } from './api'
import type { Question } from './types'

export type AnswerRecord = {
  questionId: string
  selected: string | null // null = time ran out
  isCorrect: boolean
}

// answering: waiting for a pick, revealed: showing right/wrong, finished: quiz is over
export type QuizStatus = 'answering' | 'revealed' | 'finished'

export type QuizState = {
  questions: Question[]
  index: number
  status: QuizStatus
  answers: AnswerRecord[]
  hidden: string[] // options removed by 50:50 for the current question
  fiftyFiftyUsed: boolean
  startedAt: number
  finishedAt: number | null
}

export type QuizAction =
  | { type: 'ANSWER'; option: string }
  | { type: 'TIME_UP' }
  | { type: 'NEXT'; now: number }
  | { type: 'FIFTY_FIFTY'; random?: () => number }

export function startQuiz(questions: Question[], now: number): QuizState {
  return {
    questions,
    index: 0,
    status: 'answering',
    answers: [],
    hidden: [],
    fiftyFiftyUsed: false,
    startedAt: now,
    finishedAt: null,
  }
}

export function currentQuestion(state: QuizState): Question {
  return state.questions[state.index]
}

export function score(state: QuizState): number {
  return state.answers.filter((a) => a.isCorrect).length
}

export function isLastQuestion(state: QuizState): boolean {
  return state.index === state.questions.length - 1
}

function recordAnswer(state: QuizState, selected: string | null): QuizState {
  const question = currentQuestion(state)
  return {
    ...state,
    status: 'revealed',
    answers: [...state.answers, { questionId: question.id, selected, isCorrect: selected === question.correct }],
  }
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'ANSWER':
      // ignore clicks after the answer is shown, or on options hidden by 50:50
      if (state.status !== 'answering' || state.hidden.includes(action.option)) return state
      return recordAnswer(state, action.option)

    case 'TIME_UP':
      if (state.status !== 'answering') return state
      return recordAnswer(state, null)

    case 'NEXT':
      if (state.status !== 'revealed') return state
      if (isLastQuestion(state)) return { ...state, status: 'finished', finishedAt: action.now }
      return { ...state, index: state.index + 1, status: 'answering', hidden: [] }

    case 'FIFTY_FIFTY': {
      // remove two wrong answers, only once per quiz
      if (state.fiftyFiftyUsed || state.status !== 'answering') return state
      const question = currentQuestion(state)
      const wrong = question.options.filter((o) => o !== question.correct)
      const hidden = shuffle(wrong, action.random).slice(0, 2)
      return { ...state, hidden, fiftyFiftyUsed: true }
    }
  }
}
