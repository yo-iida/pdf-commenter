interface PDFPaginationProps {
  pageNumber: number;
  numPages: number | null;
  onPageChange: (newPage: number) => void;
}

export function PDFPagination({ pageNumber, numPages, onPageChange }: PDFPaginationProps) {
  return (
    <div className="pdf-controls mt-4 flex items-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(pageNumber - 1, 1))}
        disabled={pageNumber <= 1}
        className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 font-medium"
      >
        Previous
      </button>
      <p>
        Page {pageNumber} of {numPages}
      </p>
      <button
        onClick={() => onPageChange(Math.min(pageNumber + 1, numPages || Infinity))}
        disabled={pageNumber >= (numPages || 0)}
        className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 font-medium"
      >
        Next
      </button>
    </div>
  );
} 