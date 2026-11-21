export type Comment = { text: string; pageNumber: number; content: string }

export type DocumentData = {
  comments: Comment[]
  pageOffset: number
}

const DOCUMENT_PREFIX = 'pdfReview:'
/** Pre-#40 storage: one comment list shared by every PDF. */
export const LEGACY_KEY = 'pdfComments'

const EMPTY: DocumentData = { comments: [], pageOffset: 0 }

/**
 * Identifies a PDF across sessions without reading its contents.
 * Re-opening the same file (same name, size and modification time) restores its comments.
 */
export function documentKey(file: File): string {
  return `${DOCUMENT_PREFIX}${file.name}:${file.size}:${file.lastModified}`
}

function isComment(value: unknown): value is Comment {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return typeof c.text === 'string' && typeof c.pageNumber === 'number' && typeof c.content === 'string'
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function loadDocument(key: string): DocumentData {
  const data = readJson(key) as Partial<DocumentData> | null
  if (!data || typeof data !== 'object') return EMPTY
  return {
    comments: Array.isArray(data.comments) ? data.comments.filter(isComment) : [],
    pageOffset: typeof data.pageOffset === 'number' && Number.isFinite(data.pageOffset) ? data.pageOffset : 0,
  }
}

export function saveDocument(key: string, data: DocumentData): void {
  try {
    if (data.comments.length === 0 && data.pageOffset === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch {
    // Storage full or unavailable (e.g. private mode): keep working in memory.
  }
}

export function loadLegacyComments(): Comment[] {
  const data = readJson(LEGACY_KEY)
  return Array.isArray(data) ? data.filter(isComment) : []
}

export function clearLegacyComments(): void {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
}
