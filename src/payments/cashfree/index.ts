import {
  buildCashfreeCartItems,
  createCashfreeOrder,
  fetchCashfreeOrder,
  flattenCartItems,
  type FlattenableCart,
} from './shared'

const baseFields = [
  {
    name: 'orderID',
    type: 'text',
    label: 'Cashfree Order ID',
  },
  {
    name: 'cfOrderID',
    type: 'text',
    label: 'Cashfree CF Order ID',
  },
  {
    name: 'paymentSessionID',
    type: 'text',
    label: 'Cashfree Payment Session ID',
  },
  {
    name: 'shippingAddressJSON',
    type: 'textarea',
    label: 'Cashfree Shipping Address Snapshot',
  },
] as const

type CashfreeAdapterArgs = {
  groupOverrides?: {
    admin?: Record<string, unknown>
    fields?: (args: { defaultFields: unknown[] }) => unknown[]
  }
  label?: string
}

type CashfreeConfirmOrderArgs = {
  cartsSlug?: string
  data: Record<string, unknown>
  ordersSlug?: string
  req: {
    payload: any
    user?: null | {
      id: number | string
    }
  }
  transactionsSlug?: string
}

type CashfreeInitiatePaymentArgs = {
  data: {
    billingAddress?: {
      company?: null | string
      firstName?: null | string
      lastName?: null | string
      phone?: null | string
    }
    cart: FlattenableCart & {
      subtotal?: null | number
    }
    customerEmail: string
    shippingAddress?: {
      phone?: null | string
    }
  }
  req: {
    payload: any
    user?: null | {
      id: number | string
    }
  }
  transactionsSlug: string
}

const removeArrayItemIDs = (items: unknown) => {
  if (!Array.isArray(items)) {
    return items
  }

  return items.map((item) => {
    if (!item || typeof item !== 'object') {
      return item
    }

    const { id: _id, ...itemWithoutID } = item as Record<string, unknown>

    return itemWithoutID
  })
}

export const cashfreeAdapter = (props?: CashfreeAdapterArgs) => {
  const label = props?.label || 'Cashfree'

  return {
    confirmOrder: async ({
      cartsSlug = 'carts',
      data,
      ordersSlug = 'orders',
      req,
      transactionsSlug = 'transactions',
    }: CashfreeConfirmOrderArgs) => {
      const payload = req.payload
      const providedOrderID = typeof data.orderID === 'string' ? data.orderID : data.order_id
      const hasProvidedOrderID =
        typeof providedOrderID === 'string' &&
        providedOrderID.length > 0 &&
        providedOrderID !== '{order_id}'

      if (!hasProvidedOrderID && !data.cartID) {
        throw new Error('Cashfree order ID is required.')
      }

      const transactionsResults = await payload.find({
        collection: transactionsSlug,
        limit: 1,
        req,
        sort: '-createdAt',
        where: hasProvidedOrderID
          ? {
              'cashfree.orderID': {
                equals: providedOrderID,
              },
            }
          : {
              and: [
                {
                  cart: {
                    equals: data.cartID,
                  },
                },
                {
                  paymentMethod: {
                    equals: 'cashfree',
                  },
                },
                {
                  status: {
                    equals: 'pending',
                  },
                },
              ],
            },
      })

      const transaction = transactionsResults.docs[0]

      if (!transactionsResults.totalDocs || !transaction) {
        throw new Error('No transaction found for the provided Cashfree order ID.')
      }

      const cashfreeTransactionData = (transaction as any).cashfree
      const orderID = cashfreeTransactionData?.orderID

      if (!orderID || typeof orderID !== 'string') {
        throw new Error('No Cashfree order ID is stored on this transaction.')
      }

      if (transaction.order) {
        const existingOrder =
          typeof transaction.order === 'object'
            ? transaction.order
            : await payload.findByID({
                id: transaction.order,
                collection: ordersSlug,
                req,
              })

        return {
          accessToken: existingOrder.accessToken,
          message: 'Order already confirmed.',
          orderID: existingOrder.id,
          transactionID: transaction.id,
        }
      }

      const cashfreeOrder = await fetchCashfreeOrder(orderID)

      if (cashfreeOrder.order_status !== 'PAID') {
        throw new Error(`Cashfree payment is not complete. Current status: ${cashfreeOrder.order_status}`)
      }

      const shippingAddress =
        typeof cashfreeTransactionData?.shippingAddressJSON === 'string' &&
        cashfreeTransactionData.shippingAddressJSON.length > 0
          ? JSON.parse(cashfreeTransactionData.shippingAddressJSON)
          : undefined

      const order = await payload.create({
        collection: ordersSlug,
        data: {
          amount: transaction.amount,
          currency: 'INR' as never,
          ...(req.user
            ? {
                customer: req.user.id,
              }
            : {
                customerEmail:
                  typeof data.customerEmail === 'string'
                    ? data.customerEmail
                    : transaction.customerEmail,
              }),
          items: removeArrayItemIDs(transaction.items),
          shippingAddress,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      if (transaction.cart) {
        const cartID = typeof transaction.cart === 'object' ? transaction.cart.id : transaction.cart

        await payload.update({
          id: cartID,
          collection: cartsSlug,
          data: {
            purchasedAt: new Date().toISOString(),
          },
          req,
        })
      }

      await payload.update({
        id: transaction.id,
        collection: transactionsSlug,
        data: {
          order: order.id,
          status: 'succeeded',
        },
        req,
      })

      return {
        message: 'Payment confirmed successfully.',
        orderID: order.id,
        transactionID: transaction.id,
        ...(order.accessToken ? { accessToken: order.accessToken } : {}),
      }
    },
    group: {
      name: 'cashfree',
      type: 'group' as const,
      admin: {
        condition: (data: Record<string, unknown> | undefined) => data?.paymentMethod === 'cashfree',
        ...(props?.groupOverrides?.admin || {}),
      },
      fields:
        props?.groupOverrides?.fields?.({
          defaultFields: [...baseFields] as any,
        }) || ([...baseFields] as any),
    },
    initiatePayment: async ({ data, req, transactionsSlug }: CashfreeInitiatePaymentArgs) => {
      const payload = req.payload
      const { billingAddress, cart, customerEmail, shippingAddress } = data

      if (!cart?.items?.length) {
        throw new Error('Cart is empty or not provided.')
      }

      if (!customerEmail || typeof customerEmail !== 'string') {
        throw new Error('A valid customer email is required to make a purchase.')
      }

      if (!cart.subtotal || typeof cart.subtotal !== 'number' || cart.subtotal <= 0) {
        throw new Error('A valid amount is required to initiate a payment.')
      }

      const flattenedCart = flattenCartItems(cart)
      const cashfreeCartItems = buildCashfreeCartItems({
        amount: cart.subtotal,
        cart,
      })
      const generatedOrderID = `cf_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`

      const cashfreeOrder = await createCashfreeOrder({
        amount: cart.subtotal,
        billingAddress,
        cartID: cart.id,
        customerEmail,
        customerID: req.user?.id || cart.id,
        items: cashfreeCartItems,
        orderID: generatedOrderID,
        shippingAddress,
      })

      await payload.create({
        collection: transactionsSlug,
        data: {
          ...(req.user
            ? {
                customer: req.user.id,
              }
            : {
                customerEmail,
              }),
          amount: cart.subtotal,
          billingAddress,
          cart: cart.id,
          currency: 'INR' as never,
          items: flattenedCart,
          paymentMethod: 'cashfree' as never,
          status: 'pending',
          cashfree: {
            cfOrderID: cashfreeOrder.cf_order_id,
            orderID: cashfreeOrder.order_id,
            paymentSessionID: cashfreeOrder.payment_session_id,
            shippingAddressJSON: shippingAddress ? JSON.stringify(shippingAddress) : '',
          },
        },
        req,
      })

      return {
        message: 'Payment initiated successfully.',
        orderID: cashfreeOrder.order_id,
        paymentSessionId: cashfreeOrder.payment_session_id,
      }
    },
    label,
    name: 'cashfree',
  }
}
