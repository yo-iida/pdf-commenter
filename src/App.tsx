import { useState, useEffect, lazy, Suspense } from 'react'
import PDFUploader from './PDFUploader'
import { documentKey } from './storage'
import './globals.css'

// The review screen (react-pdf, pdf.js, react-markdown) is only needed once a PDF
// is chosen; load it on demand so the upload screen stays small (#48).
const loadReviewWorkspace = () => import('./ReviewWorkspace')
const ReviewWorkspace = lazy(loadReviewWorkspace)

// Fetch the review screen and the PDF viewer in the background while the user is
// on the upload screen, so opening a PDF doesn't wait on two sequential downloads.
function prefetchReviewScreen() {
  void loadReviewWorkspace()
  void import('./PDFViewer')
}

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    const id = setTimeout(prefetchReviewScreen, 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">PDF Review App</h1>
      {!pdfFile ? (
        <PDFUploader onUpload={setPdfFile} />
      ) : (
        // Keyed by document so opening another PDF remounts the workspace and
        // loads that PDF's comments and page offset from scratch.
        <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
          <ReviewWorkspace
            key={documentKey(pdfFile)}
            storageKey={documentKey(pdfFile)}
            file={pdfFile}
            onOpenAnother={() => setPdfFile(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
