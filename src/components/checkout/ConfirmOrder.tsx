'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()
  const [error, setError] = React.useState<null | string>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return
    }

    const orderID = searchParams.get('order_id')
    const email = searchParams.get('email')

    if (orderID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('cashfree', {
          additionalData: {
            orderID,
            ...(email ? { customerEmail: email } : {}),
          },
        })
          .then(async (result) => {
            if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
              const accessToken = 'accessToken' in result ? (result.accessToken as string) : ''
              const queryParams = new URLSearchParams()

              if (email) {
                queryParams.set('email', email)
              }
              if (accessToken) {
                queryParams.set('accessToken', accessToken)
              }

              await clearCart()

              const queryString = queryParams.toString()
              router.push(`/orders/${result.orderID}${queryString ? `?${queryString}` : ''}`)
            }
          })
          .catch((err) => {
            const message =
              err instanceof Error ? err.message : 'Something went wrong while confirming your order.'

            setError(message)
          })
      }
    } else {
      // If no payment intent ID is found, redirect to the home
      router.push('/')
    }
  }, [cart, clearCart, confirmOrder, router, searchParams])

  if (error) {
    return (
      <div className="flex w-full flex-col items-center justify-start gap-4 text-center">
        <h1 className="text-2xl">We could not confirm your payment</h1>
        <Message error={error} />
        <Button asChild variant="outline">
          <Link href="/checkout">Return to checkout</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl">Confirming Order</h1>

      <LoadingSpinner className="w-12 h-6" />
    </div>
  )
}
