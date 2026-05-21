import { saleFields } from '@/collections/shared/saleFields'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    onSale: true,
    originalPriceInUSD: true,
    originalPriceInINR: true,
  },
  fields: [...defaultCollection.fields, ...saleFields],
})
