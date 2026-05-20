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
  const mobileColumnCount = Math.min(visiblePosts.length, 2)

  return (
    <div className={cn('container')}>
      <div
        className="grid gap-6 [grid-template-columns:repeat(var(--archive-mobile-columns),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--archive-desktop-columns),minmax(0,1fr))]"
        style={{
          ['--archive-mobile-columns' as string]: Math.max(mobileColumnCount, 1),
          ['--archive-desktop-columns' as string]: Math.max(visiblePosts.length, 1),
        }}
      >
        {visiblePosts.map((product, index) => {
          return <ProductGridItem key={product.id ?? index} product={product} />
        })}
      </div>
    </div>
  )
}
