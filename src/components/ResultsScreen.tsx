import { score, type QuizState } from '../lib/quiz'
import { formatDuration, percent, verdict } from '../lib/results'

type Props = {
  result: QuizState
  isNewBest: boolean
  onPlayAgain: () => void
  onNewQuiz: () => void
}

function ResultsScreen({ result, isNewBest, onPlayAgain, onNewQuiz }: Props) {
  const total = result.questions.length
  const correct = score(result)
  const pct = percent(correct, total)
  const { emoji, title } = verdict(pct)
  const duration = (result.finishedAt ?? result.startedAt) - result.startedAt

  return (
    <section className="rounded-3xl bg-white/5 p-6 text-center shadow-2xl ring-1 ring-white/10 sm:p-8">
      <p className="text-6xl" aria-hidden="true">
        {emoji}
      </p>
      <h2 className="mt-3 text-2xl font-extrabold">{title}</h2>
      {isNewBest && (
        <p className="mt-2 inline-block rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-300">
          ⭐ New best score!
        </p>
      )}

      <p className="mt-4 text-6xl font-black text-amber-400">
        {correct}
        <span className="text-3xl text-slate-500"> / {total}</span>
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3 text-sm">
        <Stat label="Score" value={`${pct}%`} />
        <Stat label="Correct" value={String(correct)} />
        <Stat label="Time" value={formatDuration(duration)} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onPlayAgain}
          className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-900 shadow-lg hover:bg-amber-300"
        >
          🔁 Play again
        </button>
        <button onClick={onNewQuiz} className="rounded-xl bg-white/10 px-6 py-3 font-semibold hover:bg-white/20">
          ⚙️ New quiz settings
        </button>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 p-3 ring-1 ring-white/10">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

export default ResultsScreen
