import { useEffect, useReducer } from 'react'
import { quizReducer, startQuiz, currentQuestion, isLastQuestion, score, type QuizState } from '../lib/quiz'
import type { Question } from '../lib/types'
import QuestionCard from './QuestionCard'

type Props = {
  questions: Question[]
  onFinish: (state: QuizState) => void
  onQuit: () => void
}

function QuizScreen({ questions, onFinish, onQuit }: Props) {
  const [state, dispatch] = useReducer(quizReducer, questions, (qs) => startQuiz(qs, Date.now()))

  // tell the parent when the last question is done
  useEffect(() => {
    if (state.status === 'finished') onFinish(state)
  }, [state, onFinish])

  if (state.status === 'finished') return null

  const question = currentQuestion(state)
  const answer = state.status === 'revealed' ? state.answers[state.answers.length - 1] : null
  const progress = ((state.index + (answer ? 1 : 0)) / questions.length) * 100

  return (
    <section className="rounded-3xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
        <span>
          Question <strong className="text-white">{state.index + 1}</strong> of {questions.length}
        </span>
        <span>
          Score: <strong className="text-amber-400">{score(state)}</strong>
        </span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
        <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <QuestionCard
        question={question}
        selected={answer?.selected ?? null}
        revealed={state.status === 'revealed'}
        hidden={state.hidden}
        onAnswer={(option) => dispatch({ type: 'ANSWER', option })}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={onQuit} className="text-sm text-slate-400 hover:text-white">
          ✕ Quit
        </button>

        {answer && (
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${answer.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} role="status">
              {answer.isCorrect ? 'Correct! 🎉' : 'Not quite'}
            </span>
            <button
              onClick={() => dispatch({ type: 'NEXT', now: Date.now() })}
              autoFocus
              className="rounded-xl bg-amber-400 px-6 py-2.5 font-bold text-slate-900 hover:bg-amber-300"
            >
              {isLastQuestion(state) ? 'See results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default QuizScreen
