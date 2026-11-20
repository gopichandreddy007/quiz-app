import { useEffect, useRef, useState } from 'react'

// counts down from `seconds` and calls `onDone` at 0.
// - it starts again from the top whenever `resetKey` changes (e.g. a new question)
// - it freezes when `running` becomes false (e.g. after answering)
export function useCountdown(seconds: number, running: boolean, onDone: () => void, resetKey: unknown) {
  const total = seconds * 1000
  const [msLeft, setMsLeft] = useState(total)

  // keep the newest onDone without restarting the timer when it changes
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // full time again for every new question. Doing this while rendering (instead of in an effect)
  // is the pattern React recommends for "reset state when a prop changes"
  const [lastKey, setLastKey] = useState(resetKey)
  if (resetKey !== lastKey) {
    setLastKey(resetKey)
    setMsLeft(total)
  }

  useEffect(() => {
    if (total === 0 || !running) return

    // like the Pomodoro timer: remember when it ends instead of counting ticks
    const endsAt = Date.now() + total
    const id = setInterval(() => {
      const left = endsAt - Date.now()
      if (left <= 0) {
        setMsLeft(0)
        clearInterval(id)
        onDoneRef.current()
      } else {
        setMsLeft(left)
      }
    }, 100)

    // stopping clears the interval, so the time shown stays where it was
    return () => clearInterval(id)
  }, [running, total, resetKey])

  return { msLeft, fraction: total === 0 ? 1 : msLeft / total }
}
