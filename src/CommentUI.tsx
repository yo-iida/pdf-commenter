import { useState } from 'react'

interface CommentUIProps {
  onSave: (comment: string) => void
}

export default function CommentUI({ onSave }: CommentUIProps) {
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSave(comment)
    setComment('')
  }

  return (
    <div className="mt-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded"
        rows={4}
        placeholder="Enter your comment here..."
      />
      <button onClick={handleSave} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
        Save Comment
      </button>
    </div>
  )
}