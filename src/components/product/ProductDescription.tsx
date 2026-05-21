'use client'
import type { Product } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price, PriceGroup } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'
import { useSearchParams } from 'next/navigation'
import {
  getCurrentPriceRange,
  getOriginalPriceRange,
  getPriceDisplay,
  getSelectedVariant,
  getValidVariants,
} from '@/utilities/pricing'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  const searchParams = useSearchParams()
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)
  const variants = getValidVariants(product)
  const selectedVariant = getSelectedVariant(product, searchParams.get('variant'))
  const productPricing = getPriceDisplay(product, currency.code)
  const selectedVariantPricing = selectedVariant ? getPriceDisplay(selectedVariant, currency.code) : null
  const currentRange = hasVariants ? getCurrentPriceRange(variants, currency.code) : null
  const originalRange = hasVariants ? getOriginalPriceRange(variants, currency.code) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{product.title}</h1>
        <div className="uppercase font-mono">
          {selectedVariantPricing?.currentPrice != null ? (
            <PriceGroup
              amount={selectedVariantPricing.currentPrice}
              className="text-base"
              containerClassName="flex flex-wrap items-center justify-end gap-2"
              originalAmount={selectedVariantPricing.originalPrice}
            />
          ) : hasVariants && currentRange ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Price highestAmount={currentRange.highest} lowestAmount={currentRange.lowest} />
              {originalRange ? (
                <Price
                  className="text-muted-foreground line-through"
                  highestAmount={originalRange.highest}
                  lowestAmount={originalRange.lowest}
                />
              ) : null}
            </div>
          ) : productPricing.currentPrice != null ? (
            <PriceGroup
              amount={productPricing.currentPrice}
              className="text-base"
              containerClassName="flex flex-wrap items-center justify-end gap-2"
              originalAmount={productPricing.originalPrice}
            />
          ) : (
            <span className="text-sm text-muted-foreground">Price on request</span>
          )}
        </div>
      </div>
      {product.description ? (
        <RichText className="" data={product.description} enableGutter={false} />
      ) : null}
      <hr />
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
