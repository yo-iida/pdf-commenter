'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PDFUploader from './PDFUploader'
import PDFViewer from './PDFViewer'
import CommentList from './CommentList'
import './globals.css'

type Comment = { text: string; pageNumber: number; content: string }

const STORAGE_KEY = 'pdfComments'

// Read saved comments synchronously during the first render. Loading them in a
// separate effect let the save effect overwrite storage with [] first, which
// wiped comments under React.StrictMode's double-invoked effects (#37).
function loadComments(): Comment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [comments, setComments] = useState<Comment[]>(loadComments)
  const [selectedText, setSelectedText] = useState<{
    text: string;
    pageNumber: number;
    position?: { x: number; y: number };
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  }, [comments])

  const handlePdfUpload = (file: File) => {
    setPdfFile(file)
  }

  const handleTextSelection = useCallback((text: string, pageNumber: number, position: { x: number; y: number }) => {
    const cleanText = text.replace(/\n/g, ' ').trim();
    setSelectedText({ text: cleanText, pageNumber, position });
  }, []);

  const handleCommentSave = (comment: string): boolean => {
    if (!selectedText || comment.trim() === '') {
      return false
    }
    const { text, pageNumber } = selectedText
    setComments((prev) => [...prev, { text, pageNumber, content: comment }])
    setSelectedText(null)
    return true
  }

  const handleClear = () => {
    setComments([]);
  };

  const handleDeleteComment = (index: number) => {
    setComments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">PDF Review App</h1>
      {!pdfFile ? (
        <PDFUploader onUpload={handlePdfUpload} />
      ) : (
        <div className="flex flex-row h-[calc(100vh-8rem)]">
          <div className="w-2/3 overflow-auto pr-4 relative" id="pdf-container">
            <PDFViewer 
              file={pdfFile} 
              onTextSelection={handleTextSelection}
            />
          </div>
          <div className="w-1/3 overflow-auto border-l border-gray-200 pl-4">
            <CommentList 
              comments={comments} 
              selectedText={selectedText} 
              onSave={handleCommentSave}
              onClear={handleClear}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      )}
    </div>
  )
}