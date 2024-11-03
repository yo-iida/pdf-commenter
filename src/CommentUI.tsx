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
      
      <div className="mt-2 flex justify-end gap-2">
        <button 
          onClick={() => setComment('')}
          className="px-3 py-1 border rounded text-gray-600 text-sm"
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Save
        </button>
      </div>
    </div>
  )
}