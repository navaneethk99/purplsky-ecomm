import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CategoryItem } from './Categories.client'

export async function Categories() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    sort: 'title',
  })

  return (
    <div>
      <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">Category</h3>

      <ul>
        {categories.docs.map((category) => {
          return (
            <li key={category.id}>
              <CategoryItem category={category} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
