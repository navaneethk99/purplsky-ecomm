'use client'

import { useField } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import React from 'react'

type SaleMode = 'manual' | 'percentage'

const roundDiscountedPrice = (originalPrice: number, discountPercentage: number): number =>
  Math.round(originalPrice * (1 - discountPercentage / 100))

export const SalePricingHelper: UIFieldClientComponent = ({ path }) => {
  const parentPath = React.useMemo(() => path.split('.').slice(0, -1).join('.'), [path])
  const getSiblingPath = React.useCallback(
    (fieldName: string) => (parentPath ? `${parentPath}.${fieldName}` : fieldName),
    [parentPath],
  )

  const { setValue: setSalePriceEnabled } = useField<boolean | null>({
    path: getSiblingPath('priceInUSDEnabled'),
  })
  const { setValue: setSalePrice, value: salePrice } = useField<number | null>({
    path: getSiblingPath('priceInUSD'),
  })
  const { value: originalPrice } = useField<number | null>({
    path: getSiblingPath('originalPriceInUSD'),
  })

  const [saleMode, setSaleMode] = React.useState<SaleMode>('manual')
  const [discountPercentage, setDiscountPercentage] = React.useState('')

  const parsedDiscountPercentage = Number.parseFloat(discountPercentage)
  const hasValidDiscount =
    Number.isFinite(parsedDiscountPercentage) &&
    parsedDiscountPercentage > 0 &&
    parsedDiscountPercentage < 100

  React.useEffect(() => {
    if (saleMode !== 'percentage') return
    if (typeof originalPrice !== 'number' || !hasValidDiscount) return

    setSalePrice(roundDiscountedPrice(originalPrice, parsedDiscountPercentage))
    setSalePriceEnabled(true)
  }, [
    hasValidDiscount,
    originalPrice,
    parsedDiscountPercentage,
    saleMode,
    setSalePrice,
    setSalePriceEnabled,
  ])

  const calculatedSalePrice =
    typeof originalPrice === 'number' && hasValidDiscount
      ? roundDiscountedPrice(originalPrice, parsedDiscountPercentage)
      : null

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        marginBottom: '16px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Sale pricing helper</div>
          <div style={{ color: 'var(--theme-elevation-600)', fontSize: '14px' }}>
            Choose whether you want to set the sale price directly or calculate it from a discount
            percentage. Only the existing original and sale price fields are saved.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <input
              checked={saleMode === 'manual'}
              name={`${path}-mode`}
              onChange={() => setSaleMode('manual')}
              type="radio"
            />
            <span>Original price + sale price</span>
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <input
              checked={saleMode === 'percentage'}
              name={`${path}-mode`}
              onChange={() => setSaleMode('percentage')}
              type="radio"
            />
            <span>Original price + discount percentage</span>
          </label>
        </div>

        {saleMode === 'percentage' ? (
          <div style={{ display: 'grid', gap: '8px', maxWidth: '280px' }}>
            <label htmlFor={`${path}-discount`} style={{ fontWeight: 500 }}>
              Discount percentage
            </label>
            <input
              id={`${path}-discount`}
              max="99.99"
              min="0.01"
              onChange={(event) => setDiscountPercentage(event.target.value)}
              placeholder="e.g. 20"
              step="0.01"
              style={{
                background: 'var(--theme-input-bg)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                color: 'var(--theme-text)',
                height: '40px',
                padding: '8px 12px',
              }}
              type="number"
              value={discountPercentage}
            />
            <div style={{ color: 'var(--theme-elevation-600)', fontSize: '14px' }}>
              {calculatedSalePrice != null
                ? `The sale price field will be set to ${calculatedSalePrice / 100} USD based on the original price.`
                : 'Enter an original price and a discount percentage to calculate the sale price.'}
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--theme-elevation-600)', fontSize: '14px' }}>
            Enter the original price below and use the standard sale price field above for manual
            discounts.
          </div>
        )}

        {saleMode === 'percentage' && typeof salePrice === 'number' ? (
          <div style={{ color: 'var(--theme-elevation-700)', fontSize: '14px' }}>
            Current computed sale price: {(salePrice / 100).toFixed(2)} USD
          </div>
        ) : null}
      </div>
    </div>
  )
}
