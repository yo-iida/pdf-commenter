import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { PDFPagination } from './components/PDFPagination'

interface PDFViewerProps {
  file: File
  onTextSelection: (text: string, pageNumber: number, position: { x: number; y: number }) => void
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
      onTextSelection(selection.toString(), pageNumber, { x: 0, y: 0 })
    }
  }

  return (
    <div className="pdf-viewer">
      <PDFPagination 
        pageNumber={pageNumber}
        numPages={numPages}
        onPageChange={setPageNumber}
      />
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
          width={850}
        />
      </Document>
      <PDFPagination 
        pageNumber={pageNumber}
        numPages={numPages}
        onPageChange={setPageNumber}
      />
    </div>
  )
}