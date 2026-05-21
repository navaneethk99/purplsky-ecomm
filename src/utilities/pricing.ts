import type { Product, Variant } from '@/payload-types'

type CurrencyCode = 'USD' | 'INR' | string

type PriceSource = {
  onSale?: boolean | null
  priceInUSD?: number | null
  priceInINR?: number | null
  originalPriceInUSD?: number | null
  originalPriceInINR?: number | null
}

type PriceDisplay = {
  currentPrice: number | null
  originalPrice: number | null
  isOnSale: boolean
}

const getCurrencySuffix = (currencyCode: CurrencyCode): 'USD' | 'INR' =>
  currencyCode === 'INR' ? 'INR' : 'USD'

export const getCurrentPrice = (
  source: PriceSource | null | undefined,
  currencyCode: CurrencyCode = 'USD',
): number | null => {
  if (!source) return null

  const key = `priceIn${getCurrencySuffix(currencyCode)}` as const
  const value = source[key]

  return typeof value === 'number' ? value : null
}

export const getOriginalPrice = (
  source: PriceSource | null | undefined,
  currencyCode: CurrencyCode = 'USD',
): number | null => {
  if (!source) return null

  const key = `originalPriceIn${getCurrencySuffix(currencyCode)}` as const
  const value = source[key]

  return typeof value === 'number' ? value : null
}

export const getPriceDisplay = (
  source: PriceSource | null | undefined,
  currencyCode: CurrencyCode = 'USD',
): PriceDisplay => {
  const currentPrice = getCurrentPrice(source, currencyCode)
  const originalPrice = getOriginalPrice(source, currencyCode)
  const isOnSale =
    Boolean(source?.onSale) &&
    typeof currentPrice === 'number' &&
    typeof originalPrice === 'number' &&
    originalPrice > currentPrice

  return {
    currentPrice,
    originalPrice: isOnSale ? originalPrice : null,
    isOnSale,
  }
}

export const getDiscountPercentage = (
  source: PriceSource | null | undefined,
  currencyCode: CurrencyCode = 'USD',
): number | null => {
  const { currentPrice, isOnSale, originalPrice } = getPriceDisplay(source, currencyCode)

  if (!isOnSale || typeof currentPrice !== 'number' || typeof originalPrice !== 'number') {
    return null
  }

  const percentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)

  return percentage > 0 ? percentage : null
}

export const getValidVariants = (product: Partial<Product> | Product): Variant[] =>
  (product.variants?.docs?.filter((variant) => variant && typeof variant === 'object') as Variant[]) || []

export const getSelectedVariant = (
  product: Partial<Product> | Product,
  variantId?: string | null,
): Variant | undefined => {
  if (!variantId) return undefined

  return getValidVariants(product).find((variant) => String(variant.id) === variantId)
}

export const getDefaultPriceSource = (product: Partial<Product> | Product): PriceSource => {
  const firstVariantWithPrice = getValidVariants(product).find((variant) => {
    const pricing = getPriceDisplay(variant, 'USD')

    return typeof pricing.currentPrice === 'number'
  })

  return firstVariantWithPrice || product
}

export const getCurrentPriceRange = (
  sources: PriceSource[],
  currencyCode: CurrencyCode = 'USD',
): { lowest: number; highest: number } | null => {
  const prices = sources
    .map((source) => getCurrentPrice(source, currencyCode))
    .filter((price): price is number => typeof price === 'number')
    .sort((a, b) => a - b)

  if (!prices.length) return null

  return {
    highest: prices[prices.length - 1],
    lowest: prices[0],
  }
}

export const getOriginalPriceRange = (
  sources: PriceSource[],
  currencyCode: CurrencyCode = 'USD',
): { lowest: number; highest: number } | null => {
  if (!sources.length) return null

  const saleDisplays = sources.map((source) => getPriceDisplay(source, currencyCode))

  if (
    !saleDisplays.length ||
    saleDisplays.some((display) => !display.isOnSale || display.originalPrice == null)
  ) {
    return null
  }

  const prices = saleDisplays
    .map((display) => display.originalPrice)
    .filter((price): price is number => typeof price === 'number')
    .sort((a, b) => a - b)

  if (!prices.length) return null

  return {
    highest: prices[prices.length - 1],
    lowest: prices[0],
  }
}
