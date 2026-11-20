import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from './useCountdown'

beforeEach(() => {
  vi.useFakeTimers() // lets tests jump forward in time instantly
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useCountdown', () => {
  it('counts down and calls onDone once at zero', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useCountdown(10, true, onDone, 0))
    expect(result.current.msLeft).toBe(10_000)

    act(() => vi.advanceTimersByTime(4000))
    expect(result.current.msLeft).toBeLessThanOrEqual(6000)
    expect(result.current.msLeft).toBeGreaterThan(5800)
    expect(onDone).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(7000))
    expect(result.current.msLeft).toBe(0)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('freezes when it stops running', () => {
    const onDone = vi.fn()
    const { result, rerender } = renderHook(({ running }) => useCountdown(10, running, onDone, 0), {
      initialProps: { running: true },
    })
    act(() => vi.advanceTimersByTime(3000))
    rerender({ running: false })
    const frozenAt = result.current.msLeft

    act(() => vi.advanceTimersByTime(20_000))
    expect(result.current.msLeft).toBe(frozenAt)
    expect(onDone).not.toHaveBeenCalled()
  })

  it('starts from the full time again when the key changes', () => {
    const { result, rerender } = renderHook(({ key, running }) => useCountdown(10, running, () => {}, key), {
      initialProps: { key: 1, running: true },
    })
    act(() => vi.advanceTimersByTime(6000))
    rerender({ key: 1, running: false }) // answered
    rerender({ key: 2, running: true }) // next question
    expect(result.current.msLeft).toBe(10_000)

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.msLeft).toBeGreaterThan(7800)
  })

  it('does nothing when the timer is off (0 seconds)', () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useCountdown(0, true, onDone, 0))
    act(() => vi.advanceTimersByTime(60_000))
    expect(onDone).not.toHaveBeenCalled()
    expect(result.current.fraction).toBe(1)
  })
})
