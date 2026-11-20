import { describe, it, expect } from 'vitest'
import { percent, verdict, formatDuration } from './results'

describe('percent', () => {
  it('rounds to a whole number', () => {
    expect(percent(7, 10)).toBe(70)
    expect(percent(2, 3)).toBe(67)
    expect(percent(0, 0)).toBe(0)
  })
})

describe('verdict', () => {
  it('matches the score', () => {
    expect(verdict(100).title).toBe('Perfect score!')
    expect(verdict(85).title).toBe('Amazing!')
    expect(verdict(60).title).toBe('Nice work!')
    expect(verdict(40).title).toBe('Not bad!')
    expect(verdict(10).title).toBe('Keep practicing!')
  })
})

describe('formatDuration', () => {
  it('shows minutes and seconds', () => {
    expect(formatDuration(83_000)).toBe('1:23')
    expect(formatDuration(5_000)).toBe('0:05')
    expect(formatDuration(600_000)).toBe('10:00')
  })
})
