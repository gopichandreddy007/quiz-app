function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          🧠 Quiz<span className="text-amber-400">Master</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">How much do you really know?</p>
      </header>

      <main className="flex-1">
        <p className="text-center text-slate-400">Quiz coming soon</p>
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
