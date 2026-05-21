'use client'

import type { Product } from '@/payload-types'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { PriceGroup } from '@/components/Price'
import { getDefaultPriceSource, getDiscountPercentage, getPriceDisplay } from '@/utilities/pricing'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, title } = product
  const priceSource = getDefaultPriceSource(product)
  const { currentPrice, originalPrice } = getPriceDisplay(priceSource, 'USD')
  const discountPercentage = getDiscountPercentage(priceSource, 'USD')

  const images =
    gallery?.flatMap((item) => (item.image && typeof item.image !== 'string' ? [item.image] : [])) || []
  const hasMultipleImages = images.length > 1
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)

  React.useEffect(() => {
    if (activeImageIndex > images.length - 1) {
      setActiveImageIndex(0)
    }
  }, [activeImageIndex, images.length])

  const image = images[activeImageIndex]

  const showPreviousImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setActiveImageIndex((currentIndex) => {
      if (!images.length) return 0
      return currentIndex === 0 ? images.length - 1 : currentIndex - 1
    })
  }

  const showNextImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setActiveImageIndex((currentIndex) => {
      if (!images.length) return 0
      return currentIndex === images.length - 1 ? 0 : currentIndex + 1
    })
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
      <Link
        aria-label={title ? `View ${title}` : 'View product'}
        className="absolute inset-0 z-10"
        href={`/products/${product.slug}`}
      />

      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <Media
            className="h-full w-full"
            height={80}
            imgClassName={clsx(
              'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]',
            )}
            resource={image}
            width={80}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Coming Soon
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/16 to-transparent" />

        {discountPercentage ? (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
            {discountPercentage}% off
          </div>
        ) : null}

        {hasMultipleImages && (
          <>
            <button
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/30 text-foreground/75 opacity-0 shadow-sm backdrop-blur-sm transition duration-200 group-hover:opacity-100 hover:bg-background/45 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={showPreviousImage}
              type="button"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            <button
              aria-label="Next product image"
              className="absolute right-3 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/30 text-foreground/75 opacity-0 shadow-sm backdrop-blur-sm transition duration-200 group-hover:opacity-100 hover:bg-background/45 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={showNextImage}
              type="button"
            >
              <ChevronRightIcon className="size-4" />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/22 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                {images.map((_, index) => {
                  const isActive = index === activeImageIndex

                  return (
                    <span
                      aria-hidden="true"
                      className={clsx(
                        'block h-2.5 rounded-full transition-all duration-200',
                        isActive ? 'w-7 bg-white/90' : 'w-2.5 bg-white/45',
                      )}
                      key={`${product.id ?? product.slug ?? title ?? 'product'}-image-${index}`}
                    />
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/*{primaryCategory && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-background/88 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-foreground backdrop-blur-sm">
              {primaryCategory}
            </span>
          </div>
        )}*/}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="space-y-1">
          {/*<p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            New Season
          </p>*/}
          <h3 className="text-base font-medium leading-tight text-foreground">
            {title || 'Untitled Product'}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/60 pt-3">
          {typeof currentPrice === 'number' ? (
            <PriceGroup
              amount={currentPrice}
              className="text-sm font-medium text-foreground"
              containerClassName="flex flex-wrap items-center gap-2"
              currencyCode="USD"
              originalAmount={originalPrice}
              originalClassName="text-xs"
            />
          ) : (
            <span className="text-sm text-muted-foreground">Price on request</span>
          )}

          {/*<span
            className={cn(
              'text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-300',
              'group-hover:text-foreground',
            )}
          >
            View Piece
          </span>*/}
        </div>
      </div>
    </article>
  )
}
