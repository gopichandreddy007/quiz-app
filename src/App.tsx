import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { fetchQuestions } from './lib/api'
import type { Question, QuizSettings } from './lib/types'
import SetupScreen from './components/SetupScreen'

const DEFAULT_SETTINGS: QuizSettings = { categoryId: null, difficulty: 'any', amount: 10, secondsPerQuestion: 20 }

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [questions, setQuestions] = useState<Question[] | null>(null)

  // a mutation, because every press of "Start" should get new questions
  const loadQuestions = useMutation({ mutationFn: fetchQuestions, onSuccess: setQuestions })

  function start(newSettings: QuizSettings) {
    setSettings(newSettings)
    loadQuestions.mutate(newSettings)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          🧠 Quiz<span className="text-amber-400">Master</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">How much do you really know?</p>
      </header>

      <main className="flex-1">
        {questions ? (
          <p className="text-center text-slate-300">Loaded {questions.length} questions</p>
        ) : (
          <SetupScreen
            initialSettings={settings}
            onStart={start}
            loading={loadQuestions.isPending}
            error={loadQuestions.error?.message ?? null}
          />
        )}
      </main>

      <footer className="mt-10 text-center text-xs text-slate-500">
        Questions from the{' '}
        <a href="https://opentdb.com/" target="_blank" rel="noreferrer" className="underline hover:text-slate-300">
          Open Trivia Database
        </a>
      </footer>
    </div>
  )
}

export default App
