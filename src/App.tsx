'use client'

import React, { useState, useEffect } from 'react'
import PDFUploader from './PDFUploader'
import PDFViewer from './PDFViewer'
import CommentUI from './CommentUI'
import CommentList from './CommentList'

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [comments, setComments] = useState<Array<{ text: string; pageNumber: number; content: string }>>([])
  const [selectedText, setSelectedText] = useState<{ text: string; pageNumber: number } | null>(null)

  useEffect(() => {
    const savedComments = localStorage.getItem('pdfComments')
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pdfComments', JSON.stringify(comments))
  }, [comments])

  const handlePdfUpload = (file: File) => {
    setPdfFile(file)
  }

  const handleTextSelection = (text: string, pageNumber: number) => {
    setSelectedText({ text, pageNumber })
  }

  const handleCommentSave = (comment: string) => {
    if (selectedText) {
      setComments([...comments, { ...selectedText, content: comment }])
      setSelectedText(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Review App</h1>
      {!pdfFile ? (
        <PDFUploader onUpload={handlePdfUpload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PDFViewer file={pdfFile} onTextSelection={handleTextSelection} />
            {selectedText && <CommentUI onSave={handleCommentSave} />}
          </div>
          <CommentList comments={comments} />
        </div>
      )}
    </div>
  )
}