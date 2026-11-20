import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQuery } from './test/render'
import App from './App'

// a fake Open Trivia DB: categories plus two easy questions (url encoded like the real api)
const QUESTIONS = {
  response_code: 0,
  results: [
    {
      category: 'Geography',
      difficulty: 'easy',
      question: 'Capital%20of%20France%3F',
      correct_answer: 'Paris',
      incorrect_answers: ['Berlin', 'Madrid', 'Rome'],
    },
    {
      category: 'Geography',
      difficulty: 'easy',
      question: 'Largest%20ocean%3F',
      correct_answer: 'Pacific',
      incorrect_answers: ['Atlantic', 'Indian', 'Arctic'],
    },
  ],
}

function fakeApi(questions: unknown = QUESTIONS) {
  const fetchMock = vi.fn((url: string) => {
    const body = url.includes('api_category') ? { trivia_categories: [{ id: 22, name: 'Geography' }] } : questions
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows the app name and the setup form', async () => {
    fakeApi()
    renderWithQuery(<App />)
    expect(screen.getByRole('heading', { name: /quizmaster/i })).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: 'Geography' })).toBeInTheDocument()
  })

  it('sends the chosen settings to the api', async () => {
    const fetchMock = fakeApi()
    const user = userEvent.setup()
    renderWithQuery(<App />)

    await screen.findByRole('option', { name: 'Geography' }) // wait for categories to load
    await user.selectOptions(screen.getByRole('combobox'), 'Geography')
    await user.click(screen.getByRole('button', { name: 'Hard' }))
    await user.click(screen.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: /start quiz/i }))

    await screen.findByText('Capital of France?')
    const url = new URL(fetchMock.mock.calls.at(-1)![0])
    expect(url.searchParams.get('category')).toBe('22')
    expect(url.searchParams.get('difficulty')).toBe('hard')
    expect(url.searchParams.get('amount')).toBe('5')
  })

  it('plays a whole quiz and shows the score, review and new best', async () => {
    fakeApi()
    const user = userEvent.setup()
    renderWithQuery(<App />)

    await user.click(screen.getByRole('button', { name: 'No timer' }))
    await user.click(await screen.findByRole('button', { name: /start quiz/i }))

    // question 1: right
    expect(await screen.findByText('Capital of France?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /paris/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Correct!')
    await user.click(screen.getByRole('button', { name: /next/i }))

    // question 2: wrong
    expect(screen.getByText('Largest ocean?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /atlantic/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Not quite')
    await user.click(screen.getByRole('button', { name: /see results/i }))

    // results
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('⭐ New best score!')).toBeInTheDocument()

    // the review lists the wrong answer with the right one
    await user.click(screen.getByText(/review your answers/i))
    const items = screen.getAllByRole('listitem')
    expect(within(items[1]).getByText('Atlantic')).toBeInTheDocument()
    expect(within(items[1]).getByText('Pacific')).toBeInTheDocument()
  })

  it('shows the high score on the setup screen afterwards', async () => {
    fakeApi()
    const user = userEvent.setup()
    renderWithQuery(<App />)

    await user.click(screen.getByRole('button', { name: 'No timer' }))
    await user.click(await screen.findByRole('button', { name: /start quiz/i }))
    await user.click(await screen.findByRole('button', { name: /paris/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /pacific/i }))
    await user.click(screen.getByRole('button', { name: /see results/i }))
    await user.click(screen.getByRole('button', { name: /new quiz settings/i }))

    const best = await screen.findByRole('heading', { name: /your best scores/i })
    expect(within(best.closest('section')!).getByText('100%')).toBeInTheDocument()
  })

  it('shows the api message when there are not enough questions', async () => {
    fakeApi({ response_code: 1, results: [] })
    const user = userEvent.setup()
    renderWithQuery(<App />)

    await user.click(await screen.findByRole('button', { name: /start quiz/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/aren't enough questions/)
  })

  it('can use 50:50 once', async () => {
    fakeApi()
    const user = userEvent.setup()
    renderWithQuery(<App />)

    await user.click(screen.getByRole('button', { name: 'No timer' }))
    await user.click(await screen.findByRole('button', { name: /start quiz/i }))
    await screen.findByText('Capital of France?')

    await user.click(screen.getByRole('button', { name: '50:50' }))
    // two wrong answers are gone, Paris is still there
    expect(screen.getAllByRole('button').filter((b) => /Berlin|Madrid|Rome/.test(b.textContent ?? ''))).toHaveLength(1)
    expect(screen.getByRole('button', { name: /paris/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: '50:50' })).toBeDisabled()
  })
})
