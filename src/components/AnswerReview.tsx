import type { QuizState } from '../lib/quiz'

// a list of every question with what you picked and the right answer
function AnswerReview({ result }: { result: QuizState }) {
  return (
    <details className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
      <summary className="cursor-pointer font-semibold">📋 Review your answers</summary>

      <ol className="mt-4 space-y-3">
        {result.questions.map((q, i) => {
          const answer = result.answers[i]
          const ok = answer?.isCorrect
          return (
            <li key={q.id} className={`rounded-xl border-l-4 bg-slate-900/70 p-4 ${ok ? 'border-emerald-400' : 'border-rose-400'}`}>
              <p className="text-sm font-medium">
                {i + 1}. {q.text}
              </p>
              <p className="mt-2 text-sm">
                <span className="text-slate-400">Your answer: </span>
                <span className={ok ? 'text-emerald-300' : 'text-rose-300'}>
                  {answer?.selected ?? '⏰ No answer (time ran out)'}
                </span>
              </p>
              {!ok && (
                <p className="text-sm">
                  <span className="text-slate-400">Correct answer: </span>
                  <span className="text-emerald-300">{q.correct}</span>
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </details>
  )
}

export default AnswerReview
