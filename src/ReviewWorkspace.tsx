import { useState, useEffect, useCallback } from 'react'
import PDFViewer from './PDFViewer'
import CommentList from './CommentList'
import type { Comment, SelectedText, TextSelectionHandler } from './types'
import {
  loadDocument,
  saveDocument,
  loadLegacyComments,
  clearLegacyComments,
} from './storage'

interface ReviewWorkspaceProps {
  file: File
  /** Storage key for this PDF; the parent also uses it as the React key so switching PDFs remounts. */
  storageKey: string
  onOpenAnother: () => void
}

export default function ReviewWorkspace({ file, storageKey, onOpenAnother }: ReviewWorkspaceProps) {
  // Lazy initialisers read storage during the first render. Do not move this into
  // an effect: under StrictMode the save effect would overwrite it first (#37).
  const [initial] = useState(() => loadDocument(storageKey))
  const [comments, setComments] = useState<Comment[]>(initial.comments)
  const [pageOffset, setPageOffset] = useState(initial.pageOffset)
  const [legacyComments, setLegacyComments] = useState<Comment[]>(loadLegacyComments)
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null)

  useEffect(() => {
    saveDocument(storageKey, { comments, pageOffset })
  }, [storageKey, comments, pageOffset])

  const handleTextSelection = useCallback<TextSelectionHandler>((text, pageNumber) => {
    const cleanText = text.replace(/\n/g, ' ').trim()
    setSelectedText({ text: cleanText, pageNumber })
  }, [])

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
    setComments([])
  }

  const handleDeleteComment = (index: number) => {
    setComments((prev) => prev.filter((_, i) => i !== index))
  }

  const importLegacy = () => {
    setComments((prev) => [...legacyComments, ...prev])
    clearLegacyComments()
    setLegacyComments([])
  }

  const discardLegacy = () => {
    clearLegacyComments()
    setLegacyComments([])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-medium truncate" title={file.name}>{file.name}</span>
        <button
          onClick={onOpenAnother}
          className="text-blue-600 hover:text-blue-800 underline text-sm shrink-0"
        >
          Open another PDF
        </button>
      </div>

      {legacyComments.length > 0 && (
        <div role="status" className="mb-2 p-3 rounded border border-yellow-300 bg-yellow-50 text-sm flex flex-wrap items-center gap-2">
          <span>
            Found {legacyComments.length} comment{legacyComments.length === 1 ? '' : 's'} saved before comments
            were stored per PDF, not linked to any PDF yet.
          </span>
          <button onClick={importLegacy} className="px-2 py-1 rounded bg-yellow-500 text-white">
            Import into this PDF
          </button>
          <button onClick={discardLegacy} className="px-2 py-1 rounded border border-yellow-400">
            Discard
          </button>
        </div>
      )}

      <div className="flex flex-row flex-1 min-h-0">
        <div className="w-2/3 overflow-auto pr-4 relative" id="pdf-container">
          <PDFViewer file={file} onTextSelection={handleTextSelection} />
        </div>
        <div className="w-1/3 overflow-auto border-l border-gray-200 pl-4">
          <CommentList
            comments={comments}
            selectedText={selectedText}
            pageOffset={pageOffset}
            onPageOffsetChange={setPageOffset}
            onSave={handleCommentSave}
            onClear={handleClear}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    </div>
  )
}
