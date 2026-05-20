import { getServerSideURL } from '@/utilities/getURL'

const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2025-01-01'

const normalizeCashfreeEnvironment = (
  value?: string,
): 'production' | 'sandbox' => {
  const normalized = value?.trim().toLowerCase()

  if (normalized === 'production' || normalized === 'prod' || normalized === 'live') {
    return 'production'
  }

  return 'sandbox'
}

type CashfreeOrderResponse = {
  cf_order_id: string
  order_amount: number
  order_currency: string
  order_id: string
  order_status: string
  payment_session_id: string
}

type CashfreeConfig = {
  appID: string
  baseURL: string
  environment: 'production' | 'sandbox'
  secretKey: string
}

export type FlattenableCart = {
  id: number | string
  items: Array<{
    [key: string]: unknown
    product: number | string | { id: number | string }
    quantity: number
    variant?: number | string | { id: number | string }
  }>
}

export const getCashfreeConfig = (): CashfreeConfig => {
  const appID = process.env.CASHFREE_APP_ID
  const secretKey = process.env.CASHFREE_SECRET_KEY
  const environment = normalizeCashfreeEnvironment(
    process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV,
  )

  if (!appID || !secretKey) {
    throw new Error('Cashfree credentials are not configured.')
  }

  return {
    appID,
    baseURL:
      environment === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg',
    environment,
    secretKey,
  }
}

const getCashfreeHeaders = () => {
  const { appID, secretKey } = getCashfreeConfig()

  return {
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
    'x-client-id': appID,
    'x-client-secret': secretKey,
  }
}

export const convertBaseAmountToDecimal = (amount: number): number => {
  return Number((amount / 100).toFixed(2))
}

export const flattenCartItems = (cart: FlattenableCart) => {
  return cart.items.map((item: FlattenableCart['items'][number]) => {
    const productID = typeof item.product === 'object' ? item.product.id : item.product
    const variantID =
      item.variant && typeof item.variant === 'object' ? item.variant.id : item.variant

    const { product: _product, variant: _variant, ...customProperties } = item

    return {
      ...customProperties,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    }
  })
}

export const buildCashfreeCartItems = (args: {
  amount: number
  cart: FlattenableCart
}) => {
  const { amount, cart } = args
  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0) || 1

  return cart.items.map((item, index) => {
    const perUnitAmount = Number(
      ((amount / 100) / totalQuantity).toFixed(2),
    )
    const productID = typeof item.product === 'object' ? item.product.id : item.product
    const variantID =
      item.variant && typeof item.variant === 'object' ? item.variant.id : item.variant

    return {
      item_amount: Number((perUnitAmount * item.quantity).toFixed(2)),
      item_id: String(variantID || productID || `item_${index + 1}`),
      item_name: variantID ? `Variant ${variantID}` : `Product ${productID}`,
      item_quantity: item.quantity,
    }
  })
}

export const getCashfreeCustomerPhone = (args: {
  billingAddress?: {
    phone?: null | string
  }
  shippingAddress?: {
    phone?: null | string
  }
}) => {
  const candidate = args.billingAddress?.phone || args.shippingAddress?.phone || ''
  const sanitized = candidate.replace(/[^\d+]/g, '')

  if (!sanitized) {
    throw new Error('A billing or shipping phone number is required for Cashfree payments.')
  }

  return sanitized
}

export const createCashfreeOrder = async (args: {
  amount: number
  billingAddress?: {
    company?: null | string
    firstName?: null | string
    lastName?: null | string
    phone?: null | string
  }
  cartID: number | string
  customerEmail: string
  customerID: number | string
  items: ReturnType<typeof buildCashfreeCartItems>
  orderID: string
  shippingAddress?: {
    phone?: null | string
  }
}) => {
  const { amount, billingAddress, cartID, customerEmail, customerID, items, orderID, shippingAddress } = args
  const { baseURL } = getCashfreeConfig()

  const customerName =
    [billingAddress?.firstName, billingAddress?.lastName].filter(Boolean).join(' ') ||
    billingAddress?.company ||
    customerEmail

  const returnURL = new URL('/checkout/confirm-order', getServerSideURL())
  returnURL.searchParams.set('order_id', orderID)
  returnURL.searchParams.set('email', customerEmail)

  const response = await fetch(`${baseURL}/orders`, {
    body: JSON.stringify({
      cart_details: {
        cart_id: String(cartID),
        cart_items: items,
      },
      customer_details: {
        customer_email: customerEmail,
        customer_id: String(customerID),
        customer_name: customerName,
        customer_phone: getCashfreeCustomerPhone({ billingAddress, shippingAddress }),
      },
      order_amount: convertBaseAmountToDecimal(amount),
      order_currency: 'INR',
      order_id: orderID,
      order_meta: {
        return_url: returnURL.toString(),
      },
      order_note: `Payload order for cart ${cartID}`,
    }),
    headers: getCashfreeHeaders(),
    method: 'POST',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Cashfree order creation failed: ${errorBody}`)
  }

  return (await response.json()) as CashfreeOrderResponse
}

export const fetchCashfreeOrder = async (orderID: string) => {
  const { baseURL } = getCashfreeConfig()

  const response = await fetch(`${baseURL}/orders/${orderID}`, {
    headers: getCashfreeHeaders(),
    method: 'GET',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Cashfree order lookup failed: ${errorBody}`)
  }

  return (await response.json()) as CashfreeOrderResponse
}
