import type { Metadata } from 'next'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Suspense } from 'react'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

export default async function ConfirmOrderPage() {
  return (
    <div className="container min-h-[90vh] flex py-12">
      <Suspense
        fallback={
          <div className="text-center w-full flex flex-col items-center justify-start gap-4">
            <h1 className="text-2xl">Confirming Order</h1>
            <LoadingSpinner className="w-12 h-6" />
          </div>
        }
      >
        <ConfirmOrder />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
