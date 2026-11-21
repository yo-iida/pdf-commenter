import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
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

/**
 * Tracks the content width of an element so the page can be rendered to fit it (#42).
 * Returns 0 until the element has been measured.
 */
function useContentWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(Math.floor(el.clientWidth))
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

interface PDFViewerProps {
  file: File
  onTextSelection: TextSelectionHandler
}

const PDFViewer = React.memo(({ file, onTextSelection }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pageContainerRef, pageWidth] = useContentWidth<HTMLDivElement>()

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
      {/* scrollbar-gutter keeps the width stable when a vertical scrollbar appears,
          so fitting the page to the width cannot oscillate. */}
      <div ref={pageContainerRef} style={{ flex: 1, overflow: 'auto', scrollbarGutter: 'stable' }}>
        {/* react-pdf 11 suspends by default; with the lazy-loaded viewer's Suspense
            boundary that would swap the whole viewer for a fallback on every page
            change, so keep the pre-11 in-place loading behaviour. */}
        <Document
          suspense={false}
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Failed to load PDF:', error)}
          options={documentOptions}>
          {pageWidth > 0 && (
            <Page
              pageNumber={pageNumber}
              onMouseUp={handleTextSelection}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={pageWidth}
            />
          )}
        </Document>
      </div>
    </div>
  )
})

export default PDFViewer