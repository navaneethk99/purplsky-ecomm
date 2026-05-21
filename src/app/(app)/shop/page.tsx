import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { fuzzySearchProducts } from '@/utilities/fuzzySearchProducts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const query = typeof searchValue === 'string' ? searchValue.trim() : ''

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    populate: {
      variants: {
        onSale: true,
        originalPriceInUSD: true,
        priceInUSD: true,
      },
    },
    select: {
      categories: true,
      description: true,
      gallery: true,
      onSale: true,
      originalPriceInUSD: true,
      priceInUSD: true,
      slug: true,
      title: true,
      variants: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(category
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(category
                ? [
                    {
                      categories: {
                        contains: category,
                      },
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  })

  const filteredProducts = query ? fuzzySearchProducts(products.docs, query) : products.docs

  const resultsText = filteredProducts.length > 1 ? 'results' : 'result'

  return (
    <div>
      {query ? (
        <p className="mb-4">
          {filteredProducts.length === 0
            ? 'There are no products that match '
            : `Showing ${filteredProducts.length} ${resultsText} for `}
          <span className="font-bold">&quot;{query}&quot;</span>
        </p>
      ) : null}

      {!query && filteredProducts.length === 0 && (
        <p className="mb-4">No products found. Please try different filters.</p>
      )}

      {filteredProducts.length > 0 ? (
        <Grid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
