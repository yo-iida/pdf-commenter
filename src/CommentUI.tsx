import { useState, useEffect, useRef } from 'react'

interface CommentUIProps {
  onSave: (comment: string) => void
}

export default function CommentUI({ onSave }: CommentUIProps) {
  const [comment, setComment] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelection = (event: MouseEvent) => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        })
        setIsOpen(true)
      } else {
        // Don't close if clicking inside the popup
        if (!popupRef.current?.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [])

  const handleSave = () => {
    onSave(comment)
    setComment('')
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 1000,
          }}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg w-72">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Add Comment</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              rows={3}
              placeholder="Enter your comment here..."
              autoFocus
            />
            
            <div className="mt-2 flex justify-end gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 border rounded text-gray-600 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}