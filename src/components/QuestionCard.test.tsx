import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuestionCard from './QuestionCard'
import type { Question } from '../lib/types'

const question: Question = {
  id: 'q1',
  category: 'Geography',
  difficulty: 'easy',
  text: 'What is the capital of France?',
  correct: 'Paris',
  options: ['Berlin', 'Paris', 'Madrid', 'Rome'],
}

function setup(props: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  const onAnswer = vi.fn()
  render(<QuestionCard question={question} selected={null} revealed={false} hidden={[]} onAnswer={onAnswer} {...props} />)
  return { onAnswer }
}

describe('QuestionCard', () => {
  it('shows the question, its category and all four options', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'What is the capital of France?' })).toBeInTheDocument()
    expect(screen.getByText('Geography')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('calls onAnswer with the clicked option', async () => {
    const { onAnswer } = setup()
    await userEvent.click(screen.getByRole('button', { name: /madrid/i }))
    expect(onAnswer).toHaveBeenCalledWith('Madrid')
  })

  it('locks the options and marks right and wrong after answering', () => {
    setup({ revealed: true, selected: 'Rome' })
    screen.getAllByRole('button').forEach((b) => expect(b).toBeDisabled())
    expect(screen.getByRole('button', { name: /paris/i })).toHaveTextContent('✓')
    expect(screen.getByRole('button', { name: /rome/i })).toHaveTextContent('✗')
  })

  it('hides the options removed by 50:50', () => {
    setup({ hidden: ['Berlin', 'Rome'] })
    expect(screen.queryByRole('button', { name: /berlin/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /rome/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /paris/i })).toBeEnabled()
  })
})
