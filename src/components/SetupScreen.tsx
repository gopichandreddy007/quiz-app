import { useState, type FormEvent, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../lib/api'
import type { Difficulty, QuizSettings } from '../lib/types'

type Props = {
  initialSettings: QuizSettings
  onStart: (settings: QuizSettings) => void
  loading: boolean
  error: string | null
}

const DIFFICULTIES: Difficulty[] = ['any', 'easy', 'medium', 'hard']
const AMOUNTS = [5, 10, 15, 20]
const TIMERS = [0, 10, 20, 30]

function SetupScreen({ initialSettings, onStart, loading, error }: Props) {
  const [settings, setSettings] = useState(initialSettings)

  // categories rarely change, so keep them for the whole visit
  const categories = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: Infinity })

  function update<K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) {
    setSettings({ ...settings, [key]: value })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onStart(settings)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
      <h2 className="text-xl font-bold">Set up your quiz</h2>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Category</span>
        <select
          value={settings.categoryId ?? ''}
          onChange={(e) => update('categoryId', e.target.value ? Number(e.target.value) : null)}
          disabled={categories.isPending}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">🎲 Any category</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {categories.isError && (
          <span className="mt-1 block text-xs text-rose-300">Couldn't load categories, "Any category" still works.</span>
        )}
      </label>

      <Choice label="Difficulty">
        {DIFFICULTIES.map((d) => (
          <Pill key={d} active={settings.difficulty === d} onClick={() => update('difficulty', d)}>
            {d === 'any' ? 'Any' : d[0].toUpperCase() + d.slice(1)}
          </Pill>
        ))}
      </Choice>

      <Choice label="Questions">
        {AMOUNTS.map((n) => (
          <Pill key={n} active={settings.amount === n} onClick={() => update('amount', n)}>
            {n}
          </Pill>
        ))}
      </Choice>

      <Choice label="Time per question">
        {TIMERS.map((s) => (
          <Pill key={s} active={settings.secondsPerQuestion === s} onClick={() => update('secondsPerQuestion', s)}>
            {s === 0 ? 'No timer' : `${s}s`}
          </Pill>
        ))}
      </Choice>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber-400 py-3.5 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-amber-300 disabled:opacity-60"
      >
        {loading ? 'Loading questions...' : 'Start Quiz →'}
      </button>
    </form>
  )
}

function Choice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-300">{label}</legend>
      <div className="grid grid-cols-4 gap-2">{children}</div>
    </fieldset>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl px-2 py-2.5 text-sm font-medium transition ${
        active ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-slate-300 ring-1 ring-white/10 hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  )
}

export default SetupScreen
