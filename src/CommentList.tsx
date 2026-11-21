import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import CommentUI from './CommentUI'
import type { Comment, SelectedText } from './types'

interface CommentListProps {
  comments: Comment[]
  /** Subtracted from each comment's page number to match the document's printed page numbers. */
  pageOffset: number
  onPageOffsetChange: (offset: number) => void
  selectedText: SelectedText | null;
  onSave: (comment: string) => boolean;
  onClear: () => void;
  onDeleteComment: (index: number) => void;
}

export default function CommentList({ comments, pageOffset, onPageOffsetChange, selectedText, onSave, onClear, onDeleteComment }: CommentListProps) {
  const [copied, setCopied] = useState(false)
  // Clear All asks for confirmation in place before deleting every comment (#39).
  const [confirmingClear, setConfirmingClear] = useState(false)
  // Keep the raw text so partial input like "-" or "" can be typed; only valid numbers are committed.
  const [offsetDraft, setOffsetDraft] = useState(String(pageOffset))

  const handleOffsetChange = (value: string) => {
    setOffsetDraft(value)
    const n = Number(value)
    if (value.trim() !== '' && Number.isFinite(n)) {
      onPageOffsetChange(n)
    }
  }

  const pageLabel = (comment: Comment) => `p.${comment.pageNumber - pageOffset}`

  // Markdown export for "Copy All". The on-screen list is rendered as React
  // elements below, so Markdown in a comment cannot turn into a Delete button (#38).
  const renderCommentsForCopy = comments.map((comment) => `## ${comment.text} (${pageLabel(comment)})

${comment.content}`).join('\n\n')

  const handleCopyAll = () => {
    navigator.clipboard.writeText(renderCommentsForCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p>Selected Text: {selectedText && selectedText.text}</p>
      <CommentUI onSave={onSave} hasSelection={selectedText !== null} />
      <div className="mb-4">
        <label htmlFor="pageOffset" className="block text-sm font-medium text-gray-700">
          Page Offset:
        </label>
        <input
          type="number"
          id="pageOffset"
          value={offsetDraft}
          onChange={(e) => handleOffsetChange(e.target.value)}
          className="mt-1 block w-24 rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={handleCopyAll} className="bg-blue-500 text-white px-4 py-2 rounded">
          {copied ? 'Copied!' : 'Copy All'}
        </button>
        <button
          onClick={() => setConfirmingClear(true)}
          disabled={comments.length === 0 || confirmingClear}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>
      {confirmingClear && comments.length > 0 && (
        <div role="alertdialog" aria-label="Confirm clearing all comments" className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-sm">
          <p className="mb-2">
            Delete all {comments.length} comment{comments.length === 1 ? '' : 's'} for this PDF? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClear()
                setConfirmingClear(false)
              }}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete all
            </button>
            <button
              autoFocus
              onClick={() => setConfirmingClear(false)}
              className="px-3 py-1 rounded border border-gray-300 bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <ul className="markdown-preview">
        {comments.map((comment, index) => (
          <li key={index} data-testid="comment">
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              {comment.text} ({pageLabel(comment)})
            </h3>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {children}
                  </a>
                ),
              }}
            >
              {comment.content}
            </ReactMarkdown>
            <button
              onClick={() => onDeleteComment(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
