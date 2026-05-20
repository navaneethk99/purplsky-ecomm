import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'

export default function Checkout() {
  return (
    <div className="container min-h-[90vh] flex">
      {(!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) && (
        <div>
          To enable checkout, set your Cashfree credentials in the environment and whitelist
          your domain in the Cashfree dashboard.
        </div>
      )}

      <h1 className="sr-only">Checkout</h1>

      <CheckoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
