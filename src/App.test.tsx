import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithQuery } from './test/render'
import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows the app name and the setup form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ trivia_categories: [] }) }))
    renderWithQuery(<App />)
    expect(screen.getByRole('heading', { name: /quizmaster/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /start quiz/i })).toBeInTheDocument()
  })
})
