'use client'
import type { Media, Product } from '@/payload-types'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React from 'react'
import { GridTileImage } from '@/components/Grid/tile'

export const CarouselClient: React.FC<{ products: Product[] }> = ({ products }) => {
  if (!products?.length) return null

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products]

  return (
    <Carousel
      className="w-full"
      opts={{ align: 'start', loop: true }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed: 1,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {carouselProducts.map((product, i) =>
          (() => {
            const carouselImage =
              typeof product.gallery?.[0]?.image === 'object'
                ? (product.gallery[0].image as Media)
                : typeof product.meta?.image === 'object'
                  ? (product.meta.image as Media)
                  : null

            if (!carouselImage) return null

            return (
              <CarouselItem
                className="relative aspect-square h-[50vh] w-2/3 max-w-[475px] flex-none md:w-1/3"
                key={`${product.slug}${i}`}
              >
                <Link className="relative h-full w-full" href={`/products/${product.slug}`}>
                  <GridTileImage
                    label={{
                      amount: product.priceInUSD!,
                      title: product.title,
                    }}
                    media={carouselImage}
                  />
                </Link>
              </CarouselItem>
            )
          })(),
        )}
      </CarouselContent>
    </Carousel>
  )
}
