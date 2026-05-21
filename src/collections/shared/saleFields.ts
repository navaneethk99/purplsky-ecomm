import { amountField } from '@payloadcms/plugin-ecommerce'
import type { Field, Validate } from 'payload'

import { ecommerceCurrenciesConfig } from '@/utilities/ecommerceCurrencies'

type CurrencyCode = 'USD' | 'INR'

type SaleSiblingData = {
  onSale?: boolean | null
  priceInUSD?: number | null
  priceInINR?: number | null
}

const validateOriginalPrice =
  (currencyCode: CurrencyCode): Validate<number | null | undefined, SaleSiblingData> =>
  (value, { siblingData }) => {
    const currentPriceField = `priceIn${currencyCode}` as const
    const currentPrice = siblingData?.[currentPriceField]

    if (!siblingData?.onSale) return true

    if (value == null) {
      return 'Set the original price to show a discounted sale price.'
    }

    if (typeof currentPrice !== 'number') return true

    if (value <= currentPrice) {
      return 'Original price must be greater than the current sale price.'
    }

    return true
  }

const usdCurrency = ecommerceCurrenciesConfig.supportedCurrencies.find((currency) => currency.code === 'USD')!

export const saleFields: Field[] = [
  {
    name: 'onSale',
    type: 'checkbox',
    defaultValue: false,
    label: 'On sale',
  },
  {
    name: 'salePricingHelper',
    type: 'ui',
    admin: {
      components: {
        Field: '@/components/admin/SalePricingHelper#SalePricingHelper',
      },
      condition: (_, siblingData) => Boolean(siblingData?.onSale),
      disableBulkEdit: true,
    },
    label: 'Sale pricing helper',
  },
  {
    type: 'row',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.onSale),
    },
    fields: [
      amountField({
        currenciesConfig: ecommerceCurrenciesConfig,
        currency: usdCurrency,
        overrides: {
          name: 'originalPriceInUSD',
          label: 'Original price in USD',
          min: 0,
          validate: validateOriginalPrice('USD'),
        },
      }),
    ],
  },
]
