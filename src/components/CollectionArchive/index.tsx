import { cn } from '@/utilities/cn'
import React from 'react'

import type { Product } from '@/payload-types'

import { ProductGridItem } from '@/components/ProductGridItem'

export type Props = {
  posts: Product[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props
  const visiblePosts = posts?.filter((product) => typeof product === 'object' && product !== null) ?? []

  return (
    <div className={cn('container')}>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${Math.max(visiblePosts.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {visiblePosts.map((product, index) => {
          return <ProductGridItem key={product.id ?? index} product={product} />
        })}
      </div>
    </div>
  )
}
