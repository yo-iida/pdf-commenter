import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Comment {
  text: string
  pageNumber: number
  content: string
}

interface CommentListProps {
  comments: Comment[]
  pageOffset?: number
}

export default function CommentList({ comments, pageOffset = 0 }: CommentListProps) {
  const [copied, setCopied] = useState(false)
  const [localPageOffset, setLocalPageOffset] = useState(pageOffset)

  const markdownComments = comments
    .map((comment) => `## ${comment.text} (Page ${comment.pageNumber - localPageOffset})\n\n${comment.content}\n`)
    .join('\n')

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdownComments)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
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
      <button onClick={handleCopyAll} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        {copied ? 'Copied!' : 'Copy All'}
      </button>
      <div className="markdown-preview">
        <ReactMarkdown>{markdownComments}</ReactMarkdown>
      </div>
    </div>
  )
}