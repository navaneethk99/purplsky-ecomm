export const cashfreeAdapterClient = () => {
  return {
    confirmOrder: true,
    initiatePayment: true,
    label: 'Cashfree',
    name: 'cashfree',
  }
}
