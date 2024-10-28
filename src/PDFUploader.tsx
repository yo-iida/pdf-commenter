import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface PDFUploaderProps {
  onUpload: (file: File) => void
}

export default function PDFUploader({ onUpload }: PDFUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0])
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the PDF file here ...</p>
      ) : (
        <p>Drag and drop a PDF file here, or click to select a file</p>
      )}
    </div>
  )
}