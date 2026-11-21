/** A comment attached to a piece of selected PDF text. */
export type Comment = {
  /** The selected PDF text the comment refers to (newlines collapsed). */
  text: string
  /** 1-based page number in the PDF file (before the page offset is applied). */
  pageNumber: number
  /** The comment body (Markdown). */
  content: string
}

/** PDF text the user has selected and not yet commented on. */
export type SelectedText = {
  text: string
  pageNumber: number
}

/** Called by the PDF viewer when the user selects text on a page. */
export type TextSelectionHandler = (text: string, pageNumber: number) => void
