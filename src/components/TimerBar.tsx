type Props = {
  msLeft: number
  fraction: number // 1 = full time left, 0 = time is up
}

function TimerBar({ msLeft, fraction }: Props) {
  const seconds = Math.ceil(msLeft / 1000)
  const urgent = seconds <= 5

  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`w-10 text-right font-mono text-sm tabular-nums ${urgent ? 'text-rose-400' : 'text-slate-300'}`}>
        ⏱ {seconds}
      </span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800"
        role="timer"
        aria-label={`${seconds} seconds left`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? 'bg-rose-500' : 'bg-sky-400'}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  )
}

export default TimerBar
