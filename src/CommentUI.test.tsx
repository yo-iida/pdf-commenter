import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentUI from './CommentUI'

describe('CommentUI', () => {
  test('disables Save and keeps the draft when no text is selected (#36)', async () => {
    const onSave = vi.fn(() => true)
    render(<CommentUI onSave={onSave} hasSelection={false} />)

    const textarea = screen.getByPlaceholderText('Enter your comment here...')
    await userEvent.type(textarea, 'my draft')

    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()
    await userEvent.click(save)

    expect(onSave).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('my draft')
    expect(screen.getByText(/Select text in the PDF/)).toBeInTheDocument()
  })

  test('disables Save for an empty or whitespace-only comment', async () => {
    const onSave = vi.fn(() => true)
    render(<CommentUI onSave={onSave} hasSelection />)

    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText('Enter your comment here...'), '   ')
    expect(save).toBeDisabled()
  })

  test('saves and clears the textarea when a selection exists', async () => {
    const onSave = vi.fn(() => true)
    render(<CommentUI onSave={onSave} hasSelection />)

    const textarea = screen.getByPlaceholderText('Enter your comment here...')
    await userEvent.type(textarea, 'looks good')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith('looks good')
    expect(textarea).toHaveValue('')
  })

  test('keeps the draft when the parent rejects the save', async () => {
    const onSave = vi.fn(() => false)
    render(<CommentUI onSave={onSave} hasSelection />)

    const textarea = screen.getByPlaceholderText('Enter your comment here...')
    await userEvent.type(textarea, 'keep me')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalled()
    expect(textarea).toHaveValue('keep me')
  })
})
