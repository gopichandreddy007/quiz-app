import { loadHighScores, topScores } from '../lib/highScores'

const MEDALS = ['🥇', '🥈', '🥉']

function HighScores() {
  const scores = topScores(loadHighScores())
  if (scores.length === 0) return null

  return (
    <section className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="mb-3 font-bold">🏅 Your best scores</h2>
      <ol className="space-y-2">
        {scores.map((s, i) => (
          <li key={s.category + s.difficulty} className="flex items-center gap-3 rounded-xl bg-slate-900/70 px-4 py-2.5 text-sm">
            <span className="w-6 text-center">{MEDALS[i] ?? i + 1}</span>
            <span className="flex-1 truncate">
              {s.category} <span className="capitalize text-slate-400">· {s.difficulty === 'any' ? 'any level' : s.difficulty}</span>
            </span>
            <span className="font-semibold text-amber-400">{s.percent}%</span>
            <span className="w-12 text-right text-slate-400">
              {s.score}/{s.total}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default HighScores
