import { documentKey, loadDocument, saveDocument, loadLegacyComments, LEGACY_KEY } from './storage'

beforeEach(() => {
  localStorage.clear()
})

test('documentKey distinguishes files by name, size and modification time', () => {
  const a = new File(['x'], 'a.pdf', { lastModified: 1 })
  expect(documentKey(a)).toBe(documentKey(new File(['y'], 'a.pdf', { lastModified: 1 })))
  expect(documentKey(a)).not.toBe(documentKey(new File(['xy'], 'a.pdf', { lastModified: 1 })))
  expect(documentKey(a)).not.toBe(documentKey(new File(['x'], 'a.pdf', { lastModified: 2 })))
  expect(documentKey(a)).not.toBe(documentKey(new File(['x'], 'b.pdf', { lastModified: 1 })))
})

test('loadDocument returns defaults for missing or malformed data', () => {
  expect(loadDocument('missing')).toEqual({ comments: [], pageOffset: 0 })

  localStorage.setItem('bad-json', '{')
  expect(loadDocument('bad-json')).toEqual({ comments: [], pageOffset: 0 })

  localStorage.setItem('wrong-shape', JSON.stringify({
    comments: [{ text: 'ok', pageNumber: 1, content: 'c' }, { text: 1 }, null],
    pageOffset: 'two',
  }))
  expect(loadDocument('wrong-shape')).toEqual({
    comments: [{ text: 'ok', pageNumber: 1, content: 'c' }],
    pageOffset: 0,
  })
})

test('saveDocument round-trips and removes empty documents', () => {
  const data = { comments: [{ text: 't', pageNumber: 2, content: 'c' }], pageOffset: 1 }
  saveDocument('doc', data)
  expect(loadDocument('doc')).toEqual(data)

  saveDocument('doc', { comments: [], pageOffset: 0 })
  expect(localStorage.getItem('doc')).toBeNull()
})

test('loadLegacyComments reads the old shared list and ignores invalid entries', () => {
  localStorage.setItem(LEGACY_KEY, JSON.stringify([{ text: 'a', pageNumber: 1, content: 'b' }, 'junk']))
  expect(loadLegacyComments()).toEqual([{ text: 'a', pageNumber: 1, content: 'b' }])
})
