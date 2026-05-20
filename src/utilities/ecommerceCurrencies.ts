export const USD = {
  code: 'USD',
  decimals: 2,
  label: 'US Dollar',
  symbol: '$',
} as const

export const INR = {
  code: 'INR',
  decimals: 2,
  label: 'Indian Rupee',
  symbol: '₹',
} as const

export const ecommerceCurrenciesConfig = {
  defaultCurrency: 'USD',
  supportedCurrencies: [USD, INR],
}
