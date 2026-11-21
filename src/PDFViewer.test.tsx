import { useEffect, type ReactNode } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PDFViewer from './PDFViewer'

// react-pdf needs canvas and a pdf.js worker; replace it with a stub that
// reports 3 pages and renders the current page number.
vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: {}, version: 'test' },
  Document: ({ children, onLoadSuccess }: { children: ReactNode; onLoadSuccess: (pdf: { numPages: number }) => void }) => {
    useEffect(() => {
      onLoadSuccess({ numPages: 3 })
    }, [])
    return <div>{children}</div>
  },
  Page: ({ pageNumber, onMouseUp }: { pageNumber: number; onMouseUp: () => void }) => (
    <div data-testid="page" onMouseUp={onMouseUp}>
      page {pageNumber}
    </div>
  ),
}))

beforeAll(() => {
  // jsdom has no layout or object URLs.
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 800 })
  URL.createObjectURL = vi.fn(() => 'blob:test')
  URL.revokeObjectURL = vi.fn()
})

const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })

function renderViewer(extra?: ReactNode) {
  const onTextSelection = vi.fn()
  render(
    <>
      <PDFViewer file={file} onTextSelection={onTextSelection} />
      {extra}
    </>
  )
  return { onTextSelection }
}

const currentPage = () => screen.getByTestId('page').textContent

describe('PDFViewer', () => {
  test('ArrowRight / ArrowLeft turn pages within bounds', async () => {
    renderViewer()
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowLeft}')
    expect(currentPage()).toBe('page 1')

    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(currentPage()).toBe('page 3')

    await userEvent.keyboard('{ArrowLeft}')
    expect(currentPage()).toBe('page 2')
  })

  test.each([
    ['textarea', <textarea key="t" aria-label="field" />],
    ['text input', <input key="i" aria-label="field" />],
    ['number input', <input key="n" type="number" aria-label="field" />],
  ])('arrow keys do not turn pages while a %s is focused', async (_, field) => {
    renderViewer(field)
    await screen.findByText('Page 1 of 3')

    await userEvent.click(screen.getByLabelText('field'))
    await userEvent.keyboard('{ArrowRight}')
    expect(currentPage()).toBe('page 1')
  })

  test('the page jump input keeps arrow keys for the caret', async () => {
    renderViewer()
    await screen.findByText('Page 1 of 3')

    await userEvent.type(screen.getByPlaceholderText('pageNum'), '3{ArrowLeft}{ArrowRight}')
    expect(currentPage()).toBe('page 1')
    await userEvent.keyboard('{Enter}')
    expect(currentPage()).toBe('page 3')
  })

  test('reports selected text with the current page on mouseup', async () => {
    const { onTextSelection } = renderViewer()
    await screen.findByText('Page 1 of 3')
    await userEvent.keyboard('{ArrowRight}')

    const page = screen.getByTestId('page')
    const range = document.createRange()
    range.selectNodeContents(page)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
    fireEvent.mouseUp(page)

    expect(onTextSelection).toHaveBeenCalledWith('page 2', 2)
  })

  test('ignores mouseup without a text selection', async () => {
    const { onTextSelection } = renderViewer()
    await screen.findByText('Page 1 of 3')

    window.getSelection()!.removeAllRanges()
    fireEvent.mouseUp(screen.getByTestId('page'))
    expect(onTextSelection).not.toHaveBeenCalled()
  })
})
