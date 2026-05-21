import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'
import { cashfreeAdapterClient } from '@/payments/cashfree/client'
import { ecommerceCurrenciesConfig } from '@/utilities/ecommerceCurrencies'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                    onSale: true,
                    originalPriceInINR: true,
                    originalPriceInUSD: true,
                    priceInINR: true,
                    priceInUSD: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                    onSale: true,
                    originalPriceInINR: true,
                    originalPriceInUSD: true,
                    priceInINR: true,
                    priceInUSD: true,
                  },
                },
              },
            }}
            currenciesConfig={ecommerceCurrenciesConfig}
            paymentMethods={[
              cashfreeAdapterClient(),
            ]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
