'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import Script from 'next/script'
import React, { FormEvent, useCallback, useMemo, useState } from 'react'

type Props = {
  paymentData: Record<string, unknown>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'production' | 'sandbox' }) => {
      checkout: (options: {
        paymentSessionId: string
        redirectTarget?: '_self' | '_blank' | '_modal' | '_top'
      }) => Promise<{
        error?: {
          message?: string
        }
        redirect?: boolean
      }>
    }
  }
}

const cashfreeMode = (() => {
  const normalized = (
    process.env.NEXT_PUBLIC_CASHFREE_MODE || process.env.NEXT_PUBLIC_CASHFREE_ENV
  )
    ?.trim()
    .toLowerCase()

  if (normalized === 'production' || normalized === 'prod' || normalized === 'live') {
    return 'production' as const
  }

  return 'sandbox' as const
})()

export const CheckoutForm: React.FC<Props> = ({ paymentData, setProcessingPayment }) => {
  const [error, setError] = React.useState<null | string>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sdkReady, setSDKReady] = useState(false)

  const paymentSessionId = useMemo(() => {
    return typeof paymentData.paymentSessionId === 'string' ? paymentData.paymentSessionId : ''
  }, [paymentData.paymentSessionId])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!sdkReady || !window.Cashfree) {
        setError('Cashfree checkout is still loading. Please try again in a moment.')
        return
      }

      if (!paymentSessionId) {
        setError('Cashfree payment session could not be created.')
        return
      }

      setError(null)
      setIsLoading(true)
      setProcessingPayment(true)

      try {
        const cashfree = window.Cashfree({
          mode: cashfreeMode,
        })

        const result = await cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_self',
        })

        if (result?.error?.message) {
          setError(result.error.message)
          setIsLoading(false)
          setProcessingPayment(false)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong while opening Cashfree.'

        setError(message)
        setIsLoading(false)
        setProcessingPayment(false)
      }
    },
    [paymentSessionId, sdkReady, setProcessingPayment],
  )

  return (
    <>
      <Script
        onLoad={() => setSDKReady(true)}
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />

      <form onSubmit={handleSubmit}>
        {error && <Message error={error} />}

        <div className="rounded-lg border border-border/70 bg-card px-5 py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Payment Partner
              </p>
              <h3 className="mt-1 text-lg font-medium text-foreground">Cashfree</h3>
            </div>
            <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              INR
            </span>
          </div>

          <Button disabled={!sdkReady || isLoading} type="submit" variant="default">
            {isLoading ? 'Redirecting...' : 'Pay with Cashfree'}
          </Button>
        </div>
      </form>
    </>
  )
}
