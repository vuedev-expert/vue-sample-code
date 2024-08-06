<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { usePaymentStore } from '@/store/use-payment-store'
const baseUrl = import.meta.env.VITE_BASE_URL

const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const payment = () => {
  paymentStore.checkoutWithSession({
    successUrl: `${baseUrl}/payment/payment-success`,
    cancelUrl: `${baseUrl}/payment/pricing-plans`,
    mode: 'subscription',
    priceId: authStore.currentPriceId,
    quantity: 1,
    allowPromotionCodes: true
  })
}
</script>

<template>
  <div class="flex items-center justify-center flex-col container mx-auto h-screen">
    <div class="flex items-center mb-4">
      <font-awesome-icon icon="circle-info" class="text-3xl mr-2"></font-awesome-icon>

      <div class="text-2xl font-normal">Your plan is expired! Please extend your Subscription to continue!</div>
    </div>

    <AppButton type="primary" @click="payment"> Checkout now </AppButton>
  </div>
</template>
