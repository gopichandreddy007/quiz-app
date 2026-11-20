import { useCallback, useEffect, useReducer } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import TimerBar from './TimerBar'
import { quizReducer, startQuiz, currentQuestion, isLastQuestion, score, type QuizState } from '../lib/quiz'
import type { Question } from '../lib/types'
import QuestionCard from './QuestionCard'

type Props = {
  questions: Question[]
  secondsPerQuestion: number // 0 = no timer
  onFinish: (state: QuizState) => void
  onQuit: () => void
}

function QuizScreen({ questions, secondsPerQuestion, onFinish, onQuit }: Props) {
  const [state, dispatch] = useReducer(quizReducer, questions, (qs) => startQuiz(qs, Date.now()))

  // one countdown per question, it stops as soon as the question is answered
  const timeUp = useCallback(() => dispatch({ type: 'TIME_UP' }), [])
  const timer = useCountdown(secondsPerQuestion, state.status === 'answering', timeUp, state.index)

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

      {secondsPerQuestion > 0 && <TimerBar msLeft={timer.msLeft} fraction={timer.fraction} />}

      <QuestionCard
        question={question}
        selected={answer?.selected ?? null}
        revealed={state.status === 'revealed'}
        hidden={state.hidden}
        onAnswer={(option) => dispatch({ type: 'ANSWER', option })}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button onClick={onQuit} className="text-sm text-slate-400 hover:text-white">
            ✕ Quit
          </button>
          {!answer && (
            <button
              onClick={() => dispatch({ type: 'FIFTY_FIFTY' })}
              disabled={state.fiftyFiftyUsed}
              title={state.fiftyFiftyUsed ? 'Already used in this quiz' : 'Remove two wrong answers (once per quiz)'}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-sky-300 ring-1 ring-sky-400/40 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              50:50
            </button>
          )}
        </div>

        {answer && (
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${answer.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} role="status">
              {answer.isCorrect ? 'Correct! 🎉' : answer.selected === null ? "⏰ Time's up!" : 'Not quite'}
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
