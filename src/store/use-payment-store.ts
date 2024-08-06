import { Status } from './../core/models/common.model'
import { PaymentService } from './../core/services/payment.service'
import { defineStore } from 'pinia'
import { useLoading } from 'vue-loading-overlay'

const paymentService = new PaymentService()
interface PaymentState {
  prices: any[]
  products: any[]
  priceStatus: Status
  status: Status
  invoices: any
  subscription: any
  taxes: any
  calculations: any
}

export const usePaymentStore = defineStore('paymentStore', {
  state: () =>
    ({
      prices: [],
      products: [],
      status: 'idle',
      priceStatus: 'idle',
      invoices: [],
      subscription: null,
      taxes: null,
      calculations: null
    } as PaymentState),
  actions: {
    getPrices() {
      this.priceStatus = 'loading'
      return paymentService
        .getPriceList()
        .then((res) => {
          this.prices = res.data
          this.priceStatus = 'idle'
          return res
        })
        .catch((e) => {
          this.priceStatus = 'error'
          throw e
        })
    },
    getProducts() {
      this.priceStatus = 'loading'
      return paymentService
        .getProductList()
        .then((res) => {
          this.products = res.data
          this.priceStatus = 'idle'
          return res
        })
        .catch((e) => {
          this.priceStatus = 'error'
          throw e
        })
    },
    getInvoices() {
      this.status = 'loading'
      paymentService
        .getInvoices()
        .then((res) => {
          if (res.data && res.data.length) this.invoices = res.data
          this.status = 'idle'
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    addUpcomingInvoice(id: string) {
      this.priceStatus = 'loading'
      return paymentService
        .addUpcomingInvoice(id)
        .then((res) => {
          this.priceStatus = 'idle'
          return res
        })
        .catch((e) => {
          this.priceStatus = 'error'
          throw e
        })
    },
    updateSubscription(id: string) {
      return paymentService
        .updateSubscription(id)
        .then((res) => {
          this.subscription = res
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    getSubscription() {
      this.status = 'loading'
      paymentService
        .getCurrentSubscription()
        .then((res) => {
          if (res) this.subscription = res
          this.status = 'idle'
        })
        .catch((e) => {
          this.status = 'error'
          throw e
        })
    },
    async updateCardDetails(payload :any) {
      const $loading = useLoading()
      const loader = $loading.show()
      try {
          const resp = (await paymentService.getCheckoutSession(payload)) as any
          if (resp) window.location.href = resp?.url
          loader.hide()
      } catch {
          loader.hide()
      }
    },
    async checkoutWithSession(payload: any) {
      const $loading = useLoading()
      const loader = $loading.show()
      try {
        const session = (await paymentService.getCheckoutSession(payload)) as any
        loader.hide()
        if (session) paymentService.redirectToCheckout({ sessionId: session.id })
      } catch {
        loader.hide()
      }
    },
    checkout(options: any = {}) {
      return paymentService.redirectToCheckout(options).then((res: any) => {
        console.log(res)
      })
    },
    unsubscribe() {
      return paymentService.unsubscribe().then((res) => {
        this.subscription = res
      })
    },
    getTaxes() {
      this.status = 'loading'
      paymentService
          .getCurrentTaxes()
          .then((res) => {
              console.log('taxes ', res.data[0])
              this.taxes = res?.data[0]
              this.status = 'idle'
          })
          .catch((e) => {
              this.status = 'error'
              throw e
          })
    },
    async getPaymentCalc(payload :any) {
      await paymentService
          .getPaymentAmounts(payload)
          .then((resp) => {
              this.calculations = resp
              this.status = 'idle'
          })
          .catch((e) => {
              this.status = 'error'
              throw e
          })
    },
  },
  getters: {
    isUserUnsubscribed: (state) => {
      return state?.subscription?.cancel_at !== null
    },
    subscribedPlan: (state) => state.products.filter(p => p.id === state.subscription.plan.product)[0],
    getSubPlanPricing: (state) => state.prices?.filter(p => p.product === state.subscription?.plan.product)[0],
    planCancelled: (state) => state.subscription?.cancel_at !== null
  }
})
