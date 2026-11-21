import React, { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { PDFPagination } from './components/PDFPagination'
import type { TextSelectionHandler } from './types'
// Bundle the worker from the installed pdfjs-dist so its version always matches the
// API version used by react-pdf (pdf.js refuses to load documents on a mismatch).
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

const documentOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
}

interface PDFViewerProps {
  file: File
  onTextSelection: TextSelectionHandler
}

const PDFViewer = React.memo(({ file, onTextSelection }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    // Create a URL for the file
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    
    // Cleanup URL when component unmounts
    return () => URL.revokeObjectURL(url)
  }, [file])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function handleTextSelection() {
    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== '') {
      onTextSelection(selection.toString(), pageNumber)
    }
  }

  const handlePageJump = useCallback((targetPage: number) => {
    if (targetPage >= 1 && targetPage <= (numPages || 1)) {
      setPageNumber(targetPage)
    }
  }, [numPages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Arrow keys move the caret while typing (comment textarea, page jump and
      // page offset inputs), so don't turn pages then.
      const active = document.activeElement as HTMLElement | null
      if (active && (active.matches('textarea, input, select') || active.isContentEditable)) {
        return
      }

      if (event.key === 'ArrowRight') {
        handlePageJump(pageNumber + 1)
      } else if (event.key === 'ArrowLeft') {
        handlePageJump(pageNumber - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [pageNumber, numPages, handlePageJump])

  return (
    <div className="pdf-viewer" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <PDFPagination 
          pageNumber={pageNumber}
          numPages={numPages}
          onPageChange={setPageNumber}
          onPageJump={handlePageJump}
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Failed to load PDF:', error)}
          options={documentOptions}>
          <Page
            pageNumber={pageNumber}
            onMouseUp={handleTextSelection}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={850}
          />
        </Document>
      </div>
    </div>
  )
})

export default PDFViewer