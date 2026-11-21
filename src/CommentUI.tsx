import { useState } from 'react'

interface CommentUIProps {
  /** Returns true when the comment was saved; the textarea is only cleared then. */
  onSave: (comment: string) => boolean
  /** Whether there is selected PDF text to attach the comment to. */
  hasSelection: boolean
}

export default function CommentUI({ onSave, hasSelection }: CommentUIProps) {
  const [comment, setComment] = useState('')
  const canSave = hasSelection && comment.trim() !== ''

  const handleSave = () => {
    if (!canSave) return
    if (onSave(comment)) {
      setComment('')
    }
  }

  return (
    <div className="bg-white p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Add Comment</h3>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        rows={3}
        placeholder="Enter your comment here..."
      />

      {!hasSelection && (
        <p className="mt-1 text-xs text-gray-500">
          Select text in the PDF to attach this comment to.
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => setComment('')}
          className="px-3 py-1 border rounded text-gray-600 text-sm"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  )
}
