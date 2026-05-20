import type { Product, CarouselBlock as CarouselBlockProps } from '@/payload-types'

import { Button } from '@/components/ui/button'
import configPromise from '@payload-config'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CarouselClient } from './Component.client'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async (props) => {
  const { id, categories, limit = 3, populateBy, selectedDocs } = props

  let products: Product[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === 'object') return category.id
          else return category
        })
      : null

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit: limit || undefined,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    products = fetchedProducts.docs
  } else if (selectedDocs?.length) {
    products = selectedDocs.map((post) => {
      if (typeof post.value !== 'string') return post.value
    }) as Product[]
  }

  if (!products?.length) return null

  return (
    <div className="w-full pt-1">
      <CarouselClient products={products} />
      <div className="mt-16 flex justify-center">
        <Button
          asChild
          size="lg"
          className="group h-16 min-w-[16rem] rounded-full border border-white/70 bg-[linear-gradient(135deg,#2f0b29_0%,#7b255f_55%,#c66b9b_100%)] px-8 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(47,11,41,0.32)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-white hover:shadow-[0_24px_55px_rgba(47,11,41,0.42)] focus-visible:scale-[1.02] focus-visible:ring-white/70 active:translate-y-0 active:scale-[0.98] active:shadow-[0_10px_24px_rgba(47,11,41,0.28)]"
        >
          <Link
            href="/shop"
            className="relative flex items-center justify-center gap-3 overflow-hidden rounded-full"
          >
            <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.24)_50%,transparent_80%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">Start Shopping</span>
            <ArrowRightIcon className="relative size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
