import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { fetchQuestions } from './lib/api'
import type { Question, QuizSettings } from './lib/types'
import { score, type QuizState } from './lib/quiz'
import { saveScore } from './lib/highScores'
import { percent } from './lib/results'
import HighScores from './components/HighScores'
import SetupScreen from './components/SetupScreen'
import ResultsScreen from './components/ResultsScreen'
import AnswerReview from './components/AnswerReview'
import QuizScreen from './components/QuizScreen'

const DEFAULT_SETTINGS: QuizSettings = { categoryId: null, difficulty: 'any', amount: 10, secondsPerQuestion: 20 }

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [result, setResult] = useState<QuizState | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  // a mutation, because every press of "Start" should get new questions
  const loadQuestions = useMutation({ mutationFn: fetchQuestions, onSuccess: setQuestions })

  function start(newSettings: QuizSettings) {
    setSettings(newSettings)
    loadQuestions.mutate(newSettings)
  }

  // save the score and remember if it beat the old best
  function finish(state: QuizState) {
    const total = state.questions.length
    const correct = score(state)
    setIsNewBest(
      saveScore({
        // a quiz with a chosen category only has questions from that category
        category: settings.categoryId === null ? 'Any category' : state.questions[0].category,
        difficulty: settings.difficulty,
        score: correct,
        total,
        percent: percent(correct, total),
        date: new Date().toISOString(),
      }),
    )
    setResult(state)
  }

  // same settings, fresh questions
  function playAgain() {
    setQuestions(null)
    setResult(null)
    loadQuestions.mutate(settings)
  }

  function backToSetup() {
    setQuestions(null)
    setResult(null)
    loadQuestions.reset()
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
        {result ? (
          <>
            <ResultsScreen result={result} isNewBest={isNewBest} onPlayAgain={playAgain} onNewQuiz={backToSetup} />
            <AnswerReview result={result} />
          </>
        ) : questions ? (
          <QuizScreen
            questions={questions}
            secondsPerQuestion={settings.secondsPerQuestion}
            onFinish={finish}
            onQuit={backToSetup}
          />
        ) : (
          <>
            <SetupScreen
              initialSettings={settings}
              onStart={start}
              loading={loadQuestions.isPending}
              error={loadQuestions.error?.message ?? null}
            />
            <HighScores />
          </>
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
