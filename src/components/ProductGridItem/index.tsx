import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { cn } from '@/utilities/cn'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { categories, gallery, priceInUSD, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  const primaryCategory =
    categories?.[0] && typeof categories[0] === 'object' ? categories[0].title : undefined

  return (
    <Link className="group block h-full w-full" href={`/products/${product.slug}`}>
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
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
            {typeof price === 'number' ? (
              <Price amount={price} className="text-sm font-medium text-foreground" />
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
    </Link>
  )
}
