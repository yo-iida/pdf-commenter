'use client'

import React, { useState, useEffect } from 'react'
import PDFUploader from './PDFUploader'
import PDFViewer from './PDFViewer'
import CommentUI from './CommentUI'
import CommentList from './CommentList'
import './globals.css'

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [comments, setComments] = useState<Array<{ text: string; pageNumber: number; content: string }>>([])
  const [selectedText, setSelectedText] = useState<{
    text: string;
    pageNumber: number;
    position?: { x: number; y: number };
  } | null>(null)

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

  const handleTextSelection = (text: string, pageNumber: number, position: { x: number; y: number }) => {
    setSelectedText({ text, pageNumber, position })
  }

  const handleCommentSave = (comment: string) => {
    if (selectedText) {
      setComments([...comments, { ...selectedText, content: comment }])
      setSelectedText(null)
    }
  }

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">PDF Review App</h1>
      {!pdfFile ? (
        <PDFUploader onUpload={handlePdfUpload} />
      ) : (
        <div className="flex flex-row h-[calc(100vh-8rem)]">
          <div className="w-2/3 overflow-auto pr-4 relative" id="pdf-container">
            <PDFViewer file={pdfFile} onTextSelection={handleTextSelection} />
            {selectedText && selectedText.position && (
              <div 
                className="absolute"
                style={{ 
                  top: `${selectedText.position.y + (document.getElementById('pdf-container')?.scrollTop ?? 0)}px`,
                  left: `${selectedText.position.x}px`
                }}
              >
                <CommentUI onSave={handleCommentSave} />
              </div>
            )}
          </div>
          <div className="w-1/3 overflow-auto border-l border-gray-200 pl-4">
            <CommentList comments={comments} />
          </div>
        </div>
      )}
    </div>
  )
}