import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PDFPagination } from './PDFPagination'

function setup(pageNumber: number, numPages: number | null) {
  const onPageChange = vi.fn()
  const onPageJump = vi.fn()
  render(
    <PDFPagination pageNumber={pageNumber} numPages={numPages} onPageChange={onPageChange} onPageJump={onPageJump} />
  )
  return { onPageChange, onPageJump }
}

describe('PDFPagination', () => {
  test('shows the current page and total', () => {
    setup(2, 5)
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  test('Previous is disabled on the first page, Next on the last', () => {
    setup(1, 1)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  test('Next is disabled until the page count is known', () => {
    setup(1, null)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  test('Previous and Next request the adjacent page', async () => {
    const { onPageChange } = setup(3, 5)
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
  })

  test('jumps to a valid page and clears the input', async () => {
    const { onPageJump } = setup(1, 5)
    const input = screen.getByPlaceholderText('pageNum')
    await userEvent.type(input, '4{Enter}')
    expect(onPageJump).toHaveBeenCalledWith(4)
    expect(input).toHaveValue('')
  })

  test.each(['0', '6', 'abc', ''])('ignores an invalid jump target %j', async (value) => {
    const { onPageJump } = setup(1, 5)
    const input = screen.getByPlaceholderText('pageNum')
    if (value) await userEvent.type(input, value)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onPageJump).not.toHaveBeenCalled()
    expect(input).toHaveValue(value)
  })
})
