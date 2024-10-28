import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Comment {
  text: string
  pageNumber: number
  content: string
}

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  const [copied, setCopied] = useState(false)

  const markdownComments = comments
    .map((comment) => `## ${comment.text} (Page ${comment.pageNumber})\n\n${comment.content}\n`)
    .join('\n')

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdownComments)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
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