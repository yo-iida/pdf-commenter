import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PDFUploader from './PDFUploader'

const fileInput = () => document.querySelector('input[type=file]') as HTMLInputElement

describe('PDFUploader', () => {
  test('passes a selected PDF to onUpload', async () => {
    const onUpload = vi.fn()
    render(<PDFUploader onUpload={onUpload} />)
    const pdf = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' })

    await userEvent.upload(fileInput(), pdf)
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(pdf))
  })

  test('ignores files that are not PDFs', async () => {
    const onUpload = vi.fn()
    render(<PDFUploader onUpload={onUpload} />)
    const txt = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    await userEvent.upload(fileInput(), txt, { applyAccept: false })
    // Give react-dropzone a chance to process the drop.
    await new Promise((r) => setTimeout(r, 50))
    expect(onUpload).not.toHaveBeenCalled()
  })

  test('shows the drop prompt', () => {
    render(<PDFUploader onUpload={() => {}} />)
    expect(screen.getByText(/Drag and drop a PDF file here/)).toBeInTheDocument()
  })
})
