import type { Question } from '../lib/types'

type Props = {
  question: Question
  selected: string | null // what the player picked (null = nothing yet or time ran out)
  revealed: boolean // true after answering, shows right and wrong
  hidden: string[] // options removed by 50:50
  onAnswer: (option: string) => void
}

const LETTERS = ['A', 'B', 'C', 'D']

function QuestionCard({ question, selected, revealed, hidden, onAnswer }: Props) {
  function optionStyle(option: string): string {
    if (!revealed) return 'bg-slate-900 ring-white/10 hover:bg-slate-800 hover:ring-amber-400/60'
    if (option === question.correct) return 'bg-emerald-500/20 ring-emerald-400 text-emerald-100'
    if (option === selected) return 'bg-rose-500/20 ring-rose-400 text-rose-100'
    return 'bg-slate-900 ring-white/5 opacity-50'
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/10 px-3 py-1">{question.category}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 capitalize">{question.difficulty}</span>
      </div>

      <h2 className="mb-6 text-xl font-semibold leading-snug sm:text-2xl">{question.text}</h2>

      <div className="grid gap-3">
        {question.options.map((option, i) => {
          const isHidden = hidden.includes(option)
          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              disabled={revealed || isHidden}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left ring-1 transition ${optionStyle(option)} ${
                isHidden ? 'invisible' : ''
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
                {LETTERS[i]}
              </span>
              <span className="flex-1">{option}</span>
              {revealed && option === question.correct && <span aria-label="correct answer">✓</span>}
              {revealed && option === selected && option !== question.correct && <span aria-label="your answer">✗</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionCard
