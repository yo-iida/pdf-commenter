import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import CommentUI from './CommentUI'

interface Comment {
  text: string
  pageNumber: number
  content: string
}

interface CommentListProps {
  comments: Comment[]
  pageOffset?: number
  selectedText: {
    text: string;
    pageNumber: number;
    position?: { x: number; y: number };
  } | null;
  onSave: (comment: string) => void;
  onClear: () => void;
}

export default function CommentList({ comments, pageOffset = 0, selectedText, onSave, onClear }: CommentListProps) {
  const [copied, setCopied] = useState(false)
  const [localPageOffset, setLocalPageOffset] = useState(pageOffset)

  const markdownComments = comments
    .map((comment) => `## ${comment.text} (p.${comment.pageNumber - localPageOffset})\n\n${comment.content}\n`)
    .join('\n')

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdownComments)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p>Selected Text: {selectedText && selectedText.text}</p>
      <CommentUI onSave={onSave} />
      <div className="mb-4">
        <label htmlFor="pageOffset" className="block text-sm font-medium text-gray-700">
          Page Offset:
        </label>
        <input
          type="number"
          id="pageOffset"
          value={localPageOffset}
          onChange={(e) => setLocalPageOffset(Number(e.target.value))}
          className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={handleCopyAll} className="bg-blue-500 text-white px-4 py-2 rounded">
          {copied ? 'Copied!' : 'Copy All'}
        </button>
        <button onClick={onClear} className="bg-red-500 text-white px-4 py-2 rounded">
          Clear All
        </button>
      </div>
      <div className="markdown-preview">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h2>
            ),
            p: ({ children }) => (
              <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
            ),
          }}
        >
          {markdownComments}
        </ReactMarkdown>
      </div>
    </div>
  )
}