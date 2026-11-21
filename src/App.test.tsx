import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// PDFViewer depends on react-pdf/canvas; replace it with a stub that can
// simulate a text selection.
vi.mock('./PDFViewer', () => ({
  default: ({ onTextSelection }: { onTextSelection: (text: string, page: number, pos: { x: number; y: number }) => void }) => (
    <button onClick={() => onTextSelection('Selected\nsentence', 2, { x: 0, y: 0 })}>select text</button>
  ),
}))

const STORAGE_KEY = 'pdfComments'

beforeEach(() => {
  localStorage.clear()
})

async function openPdf() {
  const input = document.querySelector('input[type=file]') as HTMLInputElement
  await userEvent.upload(input, new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' }))
}

test('renders the app heading on the initial upload screen', () => {
  render(<App />)
  expect(screen.getByText('PDF Review App')).toBeInTheDocument()
})

test('restores saved comments under StrictMode (#37)', async () => {
  const saved = [{ text: 'Kept', pageNumber: 1, content: 'still here' }]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

  render(
    <StrictMode>
      <App />
    </StrictMode>
  )

  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(saved)
  await openPdf()
  expect(screen.getByRole('heading', { name: 'Kept (p.1)' })).toBeInTheDocument()
})

test('ignores corrupted saved data instead of crashing', () => {
  localStorage.setItem(STORAGE_KEY, '{not json')
  render(<App />)
  expect(screen.getByText('PDF Review App')).toBeInTheDocument()
})

test('saves a comment for the selected text and persists it', async () => {
  render(<App />)
  await openPdf()

  const textarea = screen.getByPlaceholderText('Enter your comment here...')
  await userEvent.type(textarea, 'needs a citation')
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

  await userEvent.click(screen.getByRole('button', { name: 'select text' }))
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(screen.getByRole('heading', { name: 'Selected sentence (p.2)' })).toBeInTheDocument()
  expect(textarea).toHaveValue('')
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
    { text: 'Selected sentence', pageNumber: 2, content: 'needs a citation' },
  ])
})
