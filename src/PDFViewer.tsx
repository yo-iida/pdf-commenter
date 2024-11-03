import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

interface PDFViewerProps {
  file: File
  onTextSelection: (text: string, pageNumber: number) => void
}

export default function PDFViewer({ file, onTextSelection }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'
  }, [])

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

  return (
    <div className="pdf-viewer">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        options={{
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.4.168/cmaps/",
          cMapPacked: true,
        }}>
        <Page
          pageNumber={pageNumber}
          onMouseUp={handleTextSelection}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
      <div className="pdf-controls mt-4">
        <p className="mb-2">
          Page {pageNumber} of {numPages}
        </p>
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber <= 1}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || Infinity))}
          disabled={pageNumber >= (numPages || 0)}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}