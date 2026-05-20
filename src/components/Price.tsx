'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

import { INR } from '@/utilities/ecommerceCurrencies'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { formatCurrency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps && currencyCodeFromProps !== 'USD') {
      return supportedCurrencies.find((currency) => currency.code === currencyCodeFromProps)
    }

    return supportedCurrencies.find((currency) => currency.code === INR.code) || INR
  }, [currencyCodeFromProps, supportedCurrencies])

  const locale = currencyToUse?.code === INR.code ? 'en-IN' : undefined

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatCurrency(amount, { currency: currencyToUse, locale })}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse, locale })} - ${formatCurrency(highestAmount, { currency: currencyToUse, locale })}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse, locale })}`}
      </Element>
    )
  }

  return null
}
