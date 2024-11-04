import React, { useState } from 'react'

interface PDFPaginationProps {
  pageNumber: number
  numPages: number | null
  onPageChange: (page: number) => void
  onPageJump: (page: number) => void
}

export const PDFPagination: React.FC<PDFPaginationProps> = ({
  pageNumber,
  numPages,
  onPageChange,
  onPageJump
}) => {
  const [jumpInput, setJumpInput] = useState('')

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetPage = parseInt(jumpInput)
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= (numPages || 1)) {
      onPageJump(targetPage)
      setJumpInput('')
    }
  }

  return (
    <div className="flex items-center gap-4 p-2">
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={pageNumber <= 1}
        className={`${
          pageNumber <= 1
            ? 'text-gray-400 cursor-default'
            : 'text-blue-600 hover:text-blue-800 underline cursor-pointer'
        }`}
      >
        Previous
      </button>
      
      <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          placeholder="pageNum"
          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
        />
        <button 
          type="submit"
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          Go
        </button>
      </form>

      <span>
        Page {pageNumber} of {numPages}
      </span>
      
      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={!numPages || pageNumber >= numPages}
        className={`${
          !numPages || pageNumber >= numPages
            ? 'text-gray-400 cursor-default'
            : 'text-blue-600 hover:text-blue-800 underline cursor-pointer'
        }`}
      >
        Next
      </button>
    </div>
  )
} 