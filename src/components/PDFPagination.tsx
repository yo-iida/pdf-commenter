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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={pageNumber <= 1}
      >
        Previous
      </button>
      
      <form onSubmit={handleJumpSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          placeholder="Jump to page"
          style={{ width: '80px', padding: '0.25rem' }}
        />
        <button type="submit">Go</button>
      </form>

      <span>
        Page {pageNumber} of {numPages}
      </span>
      
      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={!numPages || pageNumber >= numPages}
      >
        Next
      </button>
    </div>
  )
} 