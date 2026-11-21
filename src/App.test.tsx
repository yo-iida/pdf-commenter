import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { documentKey, LEGACY_KEY } from './storage'
import type { TextSelectionHandler } from './types'

// PDFViewer depends on react-pdf/canvas; replace it with a stub that can
// simulate a text selection.
vi.mock('./PDFViewer', () => ({
  default: ({ onTextSelection }: { onTextSelection: TextSelectionHandler }) => (
    <button onClick={() => onTextSelection('Selected\nsentence', 5)}>select text</button>
  ),
}))

const pdfA = new File(['%PDF-1.4 a'], 'a.pdf', { type: 'application/pdf', lastModified: 1000 })
const pdfB = new File(['%PDF-1.4 bb'], 'b.pdf', { type: 'application/pdf', lastModified: 2000 })

beforeEach(() => {
  localStorage.clear()
})

async function openPdf(file: File) {
  const input = document.querySelector('input[type=file]') as HTMLInputElement
  await userEvent.upload(input, file)
}

async function addComment(content: string) {
  await userEvent.click(screen.getByRole('button', { name: 'select text' }))
  await userEvent.type(screen.getByPlaceholderText('Enter your comment here...'), content)
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
}

const stored = (file: File) => JSON.parse(localStorage.getItem(documentKey(file)) ?? 'null')

test('renders the app heading on the initial upload screen', () => {
  render(<App />)
  expect(screen.getByText('PDF Review App')).toBeInTheDocument()
})

test('saves a comment for the selected text and persists it per PDF', async () => {
  render(<App />)
  await openPdf(pdfA)

  const textarea = screen.getByPlaceholderText('Enter your comment here...')
  await userEvent.type(textarea, 'needs a citation')
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

  await userEvent.click(screen.getByRole('button', { name: 'select text' }))
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(screen.getByRole('heading', { name: 'Selected sentence (p.5)' })).toBeInTheDocument()
  expect(textarea).toHaveValue('')
  expect(stored(pdfA)).toEqual({
    comments: [{ text: 'Selected sentence', pageNumber: 5, content: 'needs a citation' }],
    pageOffset: 0,
  })
})

test('keeps comments separate per PDF and switches with "Open another PDF" (#40, #43)', async () => {
  render(<App />)
  await openPdf(pdfA)
  await addComment('comment on A')
  expect(screen.getByText('a.pdf')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
  await openPdf(pdfB)
  expect(screen.getByText('b.pdf')).toBeInTheDocument()
  expect(screen.queryByText('comment on A')).not.toBeInTheDocument()
  await addComment('comment on B')

  await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
  await openPdf(pdfA)
  expect(screen.getByText('comment on A')).toBeInTheDocument()
  expect(screen.queryByText('comment on B')).not.toBeInTheDocument()

  expect(stored(pdfA).comments).toHaveLength(1)
  expect(stored(pdfB).comments).toHaveLength(1)
})

test('switching PDFs clears the pending selection and draft state (#43)', async () => {
  render(<App />)
  await openPdf(pdfA)
  await userEvent.click(screen.getByRole('button', { name: 'select text' }))
  expect(screen.getByText(/Selected Text: Selected sentence/)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
  await openPdf(pdfB)
  expect(screen.queryByText(/Selected Text: Selected sentence/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})

test('remembers the page offset per PDF (#41)', async () => {
  render(<App />)
  await openPdf(pdfA)
  await addComment('offset me')

  const offset = screen.getByLabelText('Page Offset:')
  await userEvent.clear(offset)
  await userEvent.type(offset, '2')
  expect(screen.getByRole('heading', { name: 'Selected sentence (p.3)' })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
  await openPdf(pdfB)
  expect(screen.getByLabelText('Page Offset:')).toHaveValue(0)

  await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
  await openPdf(pdfA)
  expect(screen.getByLabelText('Page Offset:')).toHaveValue(2)
  expect(screen.getByRole('heading', { name: 'Selected sentence (p.3)' })).toBeInTheDocument()
  expect(stored(pdfA).pageOffset).toBe(2)
})

test('restores saved comments under StrictMode (#37)', async () => {
  const saved = { comments: [{ text: 'Kept', pageNumber: 1, content: 'still here' }], pageOffset: 0 }
  localStorage.setItem(documentKey(pdfA), JSON.stringify(saved))

  render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  await openPdf(pdfA)

  expect(screen.getByRole('heading', { name: 'Kept (p.1)' })).toBeInTheDocument()
  expect(stored(pdfA)).toEqual(saved)
})

test('ignores corrupted saved data instead of crashing', async () => {
  localStorage.setItem(documentKey(pdfA), '{not json')
  localStorage.setItem(LEGACY_KEY, '{not json')
  render(<App />)
  await openPdf(pdfA)
  expect(screen.getByText('a.pdf')).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

describe('comments saved before per-PDF storage (#40)', () => {
  const legacy = [{ text: 'Old', pageNumber: 4, content: 'from before' }]

  test('can be imported into the open PDF', async () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy))
    render(<App />)
    await openPdf(pdfA)

    expect(screen.getByRole('status')).toHaveTextContent('Found 1 comment saved before')
    expect(screen.queryByText('from before')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Import into this PDF' }))
    expect(screen.getByText('from before')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
    expect(stored(pdfA).comments).toEqual(legacy)
  })

  test('can be discarded', async () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy))
    render(<App />)
    await openPdf(pdfA)

    await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('from before')).not.toBeInTheDocument()
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  test('are left untouched until the user decides', async () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy))
    render(<App />)
    await openPdf(pdfA)
    await userEvent.click(screen.getByRole('button', { name: 'Open another PDF' }))
    await openPdf(pdfB)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(LEGACY_KEY)!)).toEqual(legacy)
  })
})
