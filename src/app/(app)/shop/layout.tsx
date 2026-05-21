import { Categories } from '@/components/layout/search/Categories'
import { SidebarFilterSkeleton } from '@/components/layout/search/SidebarFilterSkeleton'
import { FilterList } from '@/components/layout/search/filter'
import { sorting } from '@/lib/constants'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-8 my-16 pb-4 ">
        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
          <div className="w-full flex-none flex flex-col gap-4 md:gap-8 basis-1/5">
            <Suspense
              fallback={
                <React.Fragment>
                  <SidebarFilterSkeleton items={8} title="Category" />
                  <SidebarFilterSkeleton items={sorting.length} title="Sort by" />
                </React.Fragment>
              }
            >
              <Categories />
              <FilterList list={sorting} title="Sort by" />
            </Suspense>
          </div>
          <div className="min-h-screen w-full">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
