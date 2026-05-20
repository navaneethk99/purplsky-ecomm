import type { Product } from '@/payload-types'

type SearchableProduct = Pick<Product, 'title' | 'slug' | 'description' | 'categories'>

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getTextFromNode = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return ''
  }

  if ('text' in value && typeof value.text === 'string') {
    return value.text
  }

  if ('children' in value && Array.isArray(value.children)) {
    return value.children.map(getTextFromNode).join(' ')
  }

  if ('root' in value) {
    return getTextFromNode(value.root)
  }

  return ''
}

const tokenize = (value: string) => normalize(value).split(' ').filter(Boolean)

const isSubsequence = (query: string, target: string) => {
  let queryIndex = 0

  for (const char of target) {
    if (char === query[queryIndex]) {
      queryIndex += 1
    }

    if (queryIndex === query.length) {
      return true
    }
  }

  return query.length === 0
}

const levenshtein = (a: string, b: string) => {
  const rows = a.length + 1
  const cols = b.length + 1
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let i = 0; i < rows; i += 1) matrix[i]![0] = i
  for (let j = 0; j < cols; j += 1) matrix[0]![j] = j

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1

      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      )
    }
  }

  return matrix[a.length]![b.length]!
}

const getSearchText = (product: SearchableProduct) => {
  const categoryTitles =
    product.categories
      ?.map((category) => (typeof category === 'object' && category?.title ? category.title : ''))
      .filter(Boolean)
      .join(' ') || ''

  return normalize(
    [product.title, product.slug, categoryTitles, getTextFromNode(product.description)]
      .filter(Boolean)
      .join(' '),
  )
}

const scoreProduct = (product: SearchableProduct, rawQuery: string) => {
  const query = normalize(rawQuery)
  const searchText = getSearchText(product)

  if (!query || !searchText) {
    return 0
  }

  if (searchText.includes(query)) {
    return 120
  }

  const queryTokens = tokenize(query)
  const searchTokens = tokenize(searchText)

  let score = 0

  for (const token of queryTokens) {
    if (searchText.includes(token)) {
      score += 20
      continue
    }

    if (searchTokens.some((searchToken) => searchToken.startsWith(token))) {
      score += 16
      continue
    }

    if (searchTokens.some((searchToken) => token.startsWith(searchToken))) {
      score += 14
      continue
    }

    if (searchTokens.some((searchToken) => isSubsequence(token, searchToken))) {
      score += 10
      continue
    }

    if (
      searchTokens.some((searchToken) => {
        const distance = levenshtein(token, searchToken)
        const allowedDistance = Math.max(1, Math.floor(Math.max(token.length, searchToken.length) * 0.45))

        return distance <= allowedDistance
      })
    ) {
      score += 8
    }
  }

  if (isSubsequence(query.replace(/\s+/g, ''), searchText.replace(/\s+/g, ''))) {
    score += 12
  }

  return score
}

export const fuzzySearchProducts = <T extends SearchableProduct>(products: T[], rawQuery: string) =>
  products
    .map((product) => ({
      product,
      score: scoreProduct(product, rawQuery),
    }))
    .filter(({ score }) => score >= 8)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
