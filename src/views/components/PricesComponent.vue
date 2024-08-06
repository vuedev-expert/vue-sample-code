<script lang="ts" setup>
import {usePaymentStore} from '@/store/use-payment-store'
import {storeToRefs} from 'pinia'
import {computed, onMounted, ref} from 'vue'
import {useRoute} from "vue-router"
import {formatDate, openUserMail} from '@/core/helpers/common'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import {Product} from '@/core/models/product.model'
import {RouteNames} from "@/core/models/app-router.model";
import {useAuthStore} from "@/store/use-auth-store";
import AppButton from "@/core/components/AppButton.vue";
import {planProductIds} from "@/core/constants/plans-constants";

const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const route = useRoute()
const { prices, priceStatus, products, getSubPlanPricing, invoices, planCancelled, taxes } = storeToRefs(paymentStore)
const { me, currentPlan, usersInCurrentPlan, hasPayment, isLitePlanSubscribed } = storeToRefs(authStore)
const emits = defineEmits(['onSelect'])
onMounted(async () => {
  if (hasPayment.value) await paymentStore.getSubscription()
  if (hasPayment.value && isLitePlanSubscribed.value) await paymentStore.getInvoices()
  if (!prices.value.length) await paymentStore.getPrices()
  if (!products.value.length) await paymentStore.getProducts()
})
const currentPlanDetails = ref<any>({})
const recentlyUnsubscribed = ref<boolean>(false)

const listProducts = computed(() => {
  let result: Product[] = []
  if (hasPayment.value) {
    const curr = products.value.filter(p => p.id === currentPlan.value?.plan?.product)[0]
    if (curr) assigningCurrentPlan(curr)
  }
  products.value.forEach((p) => {
    let price = prices.value.find((pr) => pr.id === p.default_price)
    if (price)
      result.push({
        id: p.id,
        price: price.unit_amount/12,
        totalUsers: parseInt(p.unit_label) || 'N/A',
        priceId: price.id,
        name: p.name,
        des: p.description,
        currency: price?.currency.toUpperCase() ?? 'N/A',
        unitAmount: price?.unit_amount/12 ?? 'N/A',
        interval: price?.recurring?.interval ?? '',
        gstStatement: p.statement_descriptor ?? '',
      } as Product)
  })
  return result
})

const assigningCurrentPlan = (plan :any) => {
  currentPlanDetails.value.name = plan.name
  currentPlanDetails.value.id = plan.id
  currentPlanDetails.value.totalUsers = plan.unit_label
  currentPlanDetails.value.desc = plan.description
  currentPlanDetails.value.quantity = currentPlan.value.quantity
  currentPlanDetails.value.startDate = formatDate(new Date(currentPlan.value.period.start * 1000))
  currentPlanDetails.value.endDate = formatDate(new Date(currentPlan.value.period.end * 1000))
  currentPlanDetails.value.currency = currentPlan.value.currency.toUpperCase()
  currentPlanDetails.value.unitAmount = currentPlan.value.amount
  currentPlanDetails.value.interval = currentPlan.value.plan.interval
  currentPlanDetails.value.usage = currentPlanTotalUsage()
}

const currentPlanTotalUsage = () => {
  let today = new Date()
  let endDate = new Date(currentPlanDetails.value.endDate.split('/').reverse().join('/'))
  return (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth())
}

const payment = (id: string) => {
  emits('onSelect', id)
}

const isUpdateSubs = computed(() => route.name === RouteNames.UPDATE_SUBSCRIPTION)

const LitePlanCheck = (planId: string, total :number) => {
  return planId === currentPlanDetails?.value?.id && planId === planProductIds.lite && usersInCurrentPlan.value != total
}

const displayPlan = (id :string) => {
  if (currentPlan.value && hasPayment.value) {
    const currPlan = products.value?.filter((p: any) => p.id === currentPlan.value?.plan?.product)[0]
    const selectedPlan = products.value?.filter((p: any) => p.id === id)[0]
    const currPlanIndex = products.value?.findIndex(p => p.id === currPlan.id)
    const selectedPlanIndex = products.value?.findIndex(p => p.id === selectedPlan.id)
    if (isUpdateSubs.value) {
      if (selectedPlan.id === planProductIds.lite && usersInCurrentPlan.value < 4) return true
      return currPlanIndex < selectedPlanIndex // Downgrade plan check
    } else {
      recentlyUnsubscribed.value = true
      if (selectedPlan.id === planProductIds.lite && usersInCurrentPlan.value < 4) return true
      else return currPlanIndex < selectedPlanIndex
    }
  }
  else return true
}

const paidAmount = computed(() => {
  if (currentPlanDetails.value?.id === planProductIds.lite) { // adding invoices paid amount for Lite plan
    return (invoices.value?.reduce((accumulator :any, obj :any) => accumulator + obj.amount_paid, 0)/100).toFixed(2)
  }
  return ((currentPlan.value?.amount_excluding_tax / 100) + (currentPlan.value?.amount_excluding_tax / 100) * 0.1).toFixed(2)
})

const planBtnLabel = (item :any) => {
  if (hasPayment.value) {
    if (LitePlanCheck(item.id, item.totalUsers)) return 'Add more users'
    else if (item.id !== currentPlanDetails.value?.id) return planCancelled.value ? 'Subscribe': `Upgrade to ${item.name}`
  } else return 'Subscribe'
}
</script>
<template>
  <ComponentLoading :loading="priceStatus === 'loading'"></ComponentLoading>
  <div v-if="prices.length && products.length" class="flex-1 max-w-screen-lg mx-auto">
    <div class="mx-auto text-center mb-8 lg:mb-12">
      <div class="subscription-header">
        <div class="heading flex-col gap-4 lg:gap-0 lg:flex-row">
          <h1 class="text-primary-500 font-extrabold text-3xl md:text-4xl" :class="[isUpdateSubs ? 'lg:ml-28':'']">
            {{ isUpdateSubs ? 'Update Subscription' : 'Choose your subscription plan'}}
          </h1>
          <AppButton v-if="currentPlan && hasPayment" id="backBtn" icon="arrow-left" @click="$router.push({ name: RouteNames.PAYMENT_DETAILS })" class="ml-auto" type="primary">
            Back
          </AppButton>
          <AppButton v-else id="signOutBtn" type="primary" @click="authStore.logout()">Sign out</AppButton>
        </div>
      </div>
      <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900"></h2>
    </div>
    <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3 items-end">

      <!-- Current Plan  -->
      <template v-if="hasPayment && currentPlanDetails">
        <div class="current-plan">
          <h4 class="text-center font-extrabold text-lg text-gray-500 mb-2">{{ hasPayment ? isUpdateSubs? 'Current Plan':'Recently unsubscribed':'' }}</h4>
          <div class="card w-full flex flex-col p-6 mx-auto text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8">
            <div class="card-heading text-2xl font-semibold mb-4">{{ currentPlanDetails?.name }}</div>
            <div class="card-body">
              <div class="flex justify-center items-baseline text-primary-500">
                <span class="mr-2 text-2xl font-extrabold">{{ `${(getSubPlanPricing?.unit_amount/100)/12} ${currentPlanDetails?.currency}` }}</span>
                <span>{{ currentPlanDetails?.id === planProductIds.lite? '/user/month':'/month' }}</span>
              </div>
              <div class="flex-1">
                <div class="period-details pt-3">
                  <div class="flex justify-between">
                    <span>Plan Start Date</span><span>:</span><span>{{ currentPlanDetails?.startDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>No. of Subscribe Users</span><span>:</span><span>{{ usersInCurrentPlan }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Plan Renews at</span><span>:</span><span>{{ currentPlanDetails?.endDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Total Amount Paid</span><span>:</span><span>{{
                      `${paidAmount} ${currentPlanDetails?.currency}`
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Total Usage</span><span>:</span><span>{{ currentPlanDetails?.usage }} Months</span>
                  </div>
                  <div class="text-left"><small>*Above amount inclusive of GST ({{ `${taxes?.percentage}%` }})</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- All Plans -->
      <template v-for="item in listProducts" :key="item.id">
        <div v-if="displayPlan(item.id)">
          <h4 v-if="currentPlan?.plan?.product === item.id && recentlyUnsubscribed" class="text-center font-extrabold text-lg text-gray-500 mb-2"></h4>
          <div
              class="card w-full flex flex-col p-6 mx-auto text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8"
          >
            <h3 class="mb-2 text-2xl font-semibold">{{ item.name || 'N/A' }}</h3>
            <div v-if="item.name !== 'Enterprise'" class="flex justify-center items-baseline text-primary-500">
              <span class="mr-1 text-2xl font-extrabold">{{ `${item.unitAmount / 100} ${item.currency}` }}</span>
              <span> {{ item.id === planProductIds.lite ? '/user/month' : '/month' }}</span>
            </div>
            <small v-if="item.gstStatement" class="text-primary-500 mb-1">{{ `*${item.gstStatement}` }}</small>
            <h3 v-if="hasPayment" class="mb-3 text-1xl font-semibold capitalize text-primary-500">
              {{
                LitePlanCheck(item.id, item.totalUsers) ? `Available users: ${item.totalUsers - usersInCurrentPlan}` : ''
              }}
            </h3>
            <!-- List -->
            <div class="flex-1 mb-4 text-left">
              <p class="text-gray-600 mb-2">{{ item.des }}</p>
            </div>
            <AppButton v-if="item.id === planProductIds.enterprise" id="EnterprisePlan" @click="openUserMail" type="primary">Contact Us</AppButton>
            <AppButton
                v-else
                :id="`${item.name}Plan`"
                :disabled="isUpdateSubs && !LitePlanCheck(item.id, item.totalUsers) && item.id === currentPlanDetails?.id"
                type="primary" @click="() => payment(item)">
              {{ planBtnLabel(item) }}
            </AppButton>
          </div>
        </div>
      </template>

    </div>
    <h4 class="py-10 text-red-500 text-[15px] text-center">**All the subscriptions above are Billed Annually</h4>
  </div>
</template>

<style scoped>
.card{
  height: 320px;
  position: relative;
  box-shadow: rgba(0, 0, 0, 0.35) 0 5px 10px;
}
</style>
