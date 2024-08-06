<template>
  <div class="w-full flex-1 max-w-md">
    <img class="mb-8 mx-auto" src="https://aws-s3-pathap-southeast-2.amazonaws.com/Project-logo.png" alt="Project Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-6 md:p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">OTP Verification</div>
      <div class="text-center mb-5">
        <span>Enter the verification code sent to </span>
        <b v-if="route.query.email">{{ route.query.email }}</b>
        <span v-else>your email address</span>
      </div>
      <form @submit="submitForm">
        <div class="form-item" :class="{ 'has-error': v$.otp.$errors.length > 0 || invalidOtp }">
          <input
            id="otpField"
            v-model="state.otp"
            v-maska="'######'"
            type="text"
            class="form-input text-center"
            placeholder="Enter your code"
            maxlength="6"
            @focus="resetOtpValidation"
          />
          <p v-if="v$.otp.$errors.length" class="form-error-message text-center">
            {{ v$.otp.$errors[0].$message }}
          </p>
          <p v-if="invalidOtp" class="form-error-message text-center">
            {{ invalidOtp }}
          </p>
        </div>
        <div class="my-5 text-center">
          <span>Didn't receive the code? </span>
          <span v-if="duration > 0"
            >Please wait <b id="timer">{{ duration }}</b></span
          >
          <span v-else id="resendOtp" class="cursor-pointer text-primary-500 font-bold" @click="resendOtp">RESEND OTP</span>
        </div>
        <div class="text-center">
          <button
            id="verifyOtpBtn"
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Verify
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
        <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { minLength, required } from '@vuelidate/validators'
import { computed, ref } from 'vue'
import { resendCode, verifyCode } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'
import { RouteNames } from '@/core/models/app-router.model'

interface OtpForm {
  otp: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const invalidOtp = ref<string>('')
const status = ref<string>('idle')
const duration = ref<number>(60)
const state = ref<OtpForm>({
  otp: ''
})

const countDown = () => {
  const timer = setInterval(() => {
    duration.value = duration.value - 1

    if (duration.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
countDown()

const rules = computed(() => ({
  otp: { required, minLengthValue: minLength(6) }
}))

function resetOtpValidation() {
  invalidOtp.value = ''
}

async function resendOtp() {
  resetOtpValidation()
  try {
    await resendCode({ username: route.query.username!.toString() })
    toast.info('Please check your email for the new code')
    countDown()
  } catch (e) {
    console.log('Resend OTP ERROR', e)
  }
}

async function submitForm(event?: Event) {
  event?.preventDefault()

  resetOtpValidation()
  await v$.value.$validate()
  if (!v$.value.$invalid) {
    status.value = 'loading'
    try {
      await verifyCode({
        username: route.query.username!.toString(),
        code: state.value.otp
      })
      toast.success('Account confirmed successfully.')
      await router.push({ name: RouteNames.SIGN_IN })
    } catch (e) {
      console.log('Verify OTP ERROR', e)
      invalidOtp.value = 'Code invalid'
    }
    status.value = 'idle'
  }
}

const v$ = useVuelidate(rules, state)
</script>
