import { useState, type ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentList from './CommentList'

const baseProps = {
  selectedText: null,
  pageOffset: 0,
  onPageOffsetChange: () => {},
  onSave: () => true,
  onClear: () => {},
}

// CommentList's page offset is controlled by the parent; hold it in state here.
function WithOffsetState(props: Omit<ComponentProps<typeof CommentList>, 'pageOffset' | 'onPageOffsetChange'>) {
  const [pageOffset, setPageOffset] = useState(0)
  return <CommentList {...props} pageOffset={pageOffset} onPageOffsetChange={setPageOffset} />
}

describe('CommentList', () => {
  test('links in a comment body are real links, not delete buttons (#38)', async () => {
    const onDeleteComment = vi.fn()
    render(
      <CommentList
        {...baseProps}
        onDeleteComment={onDeleteComment}
        comments={[
          { text: 'First', pageNumber: 1, content: 'keep me' },
          { text: 'Second', pageNumber: 2, content: 'see [ref](#0) and [docs](https://example.com)' },
        ]}
      />
    )

    const ref = screen.getByRole('link', { name: 'ref' })
    expect(ref).toHaveAttribute('href', '#0')
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('href', 'https://example.com')

    await userEvent.click(ref)
    expect(onDeleteComment).not.toHaveBeenCalled()
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2)
  })

  test('Delete removes the comment it belongs to', async () => {
    const onDeleteComment = vi.fn()
    render(
      <CommentList
        {...baseProps}
        onDeleteComment={onDeleteComment}
        comments={[
          { text: 'First', pageNumber: 1, content: 'a' },
          { text: 'Second', pageNumber: 2, content: 'b' },
        ]}
      />
    )

    const second = screen.getAllByTestId('comment')[1]
    await userEvent.click(within(second).getByRole('button', { name: 'Delete' }))
    expect(onDeleteComment).toHaveBeenCalledWith(1)
  })

  test('selected text with Markdown characters is shown literally (#38)', () => {
    render(
      <CommentList
        {...baseProps}
        onDeleteComment={() => {}}
        comments={[{ text: '# not a *heading* [x](#1)', pageNumber: 3, content: 'c' }]}
      />
    )

    expect(screen.getByRole('heading', { name: '# not a *heading* [x](#1) (p.3)' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  test('Copy All exports Markdown with the page offset applied', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(
      <WithOffsetState
        selectedText={null}
        onSave={() => true}
        onClear={() => {}}
        onDeleteComment={() => {}}
        comments={[
          { text: 'Intro', pageNumber: 5, content: 'fix typo' },
          { text: 'Body', pageNumber: 7, content: 'clarify' },
        ]}
      />
    )

    const offset = screen.getByLabelText('Page Offset:')
    await user.clear(offset)
    await user.type(offset, '2')
    await user.click(screen.getByRole('button', { name: 'Copy All' }))

    expect(writeText).toHaveBeenCalledWith('## Intro (p.3)\n\nfix typo\n\n## Body (p.5)\n\nclarify')
    expect(screen.getByRole('heading', { name: 'Intro (p.3)' })).toBeInTheDocument()
  })

  test('accepts a negative page offset typed from "-"', async () => {
    const onPageOffsetChange = vi.fn()
    render(
      <CommentList
        {...baseProps}
        onPageOffsetChange={onPageOffsetChange}
        onDeleteComment={() => {}}
        comments={[]}
      />
    )

    const offset = screen.getByLabelText('Page Offset:')
    await userEvent.clear(offset)
    await userEvent.type(offset, '-3')
    expect(onPageOffsetChange).toHaveBeenLastCalledWith(-3)
  })
})
