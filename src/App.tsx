import { useState } from 'react'
import PDFUploader from './PDFUploader'
import ReviewWorkspace from './ReviewWorkspace'
import { documentKey } from './storage'
import './globals.css'

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">PDF Review App</h1>
      {!pdfFile ? (
        <PDFUploader onUpload={setPdfFile} />
      ) : (
        // Keyed by document so opening another PDF remounts the workspace and
        // loads that PDF's comments and page offset from scratch.
        <ReviewWorkspace
          key={documentKey(pdfFile)}
          storageKey={documentKey(pdfFile)}
          file={pdfFile}
          onOpenAnother={() => setPdfFile(null)}
        />
      )}
    </div>
  )
}
