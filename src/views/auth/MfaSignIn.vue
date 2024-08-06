<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { useRouter } from 'vue-router'
import { RouteNames } from '@/core/models/app-router.model'
import { computed, ref, watchEffect } from 'vue'
import { minLength, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

interface TotpForm {
  username: string
  password: string
  totpCode: string
}

const authStore = useAuthStore()
const router = useRouter()
const input = ref<HTMLInputElement | null>(null)

watchEffect(() => {
  if (input.value) {
    input.value.focus()
  }
})

if (authStore.credentials == null) {
  router.replace({ name: RouteNames.SIGN_IN })
}

const state = ref<TotpForm>({
  username: authStore.credentials?.username ?? '',
  password: authStore.credentials?.password ?? '',
  totpCode: ''
})

const rules = computed(() => ({
  totpCode: { required, minLengthValue: minLength(6) }
}))

const v$ = useVuelidate(rules, state)

const submitForm = async (event?: Event) => {
  event?.preventDefault()

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    await authStore.signIn(state.value)
  }
}
</script>

<template>
  <div class="w-full flex-1 max-w-md">
    <img class="mb-8 mx-auto" src="https://aws-s3-pathap-southeast-2.amazonaws.com/Project-logo.png" alt="Project Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-6 md:p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">2-Factor Authentication</div>
      <div class="mb-5">
        <span>Please type in the code displayed on your authenticator app from your device</span>
      </div>
      <form @submit="submitForm">
        <div class="form-item" :class="{ 'has-error': v$.totpCode.$errors.length > 0 }">
          <span class="form-label"><b>Code from authenticator app</b></span>
          <input
            id="totpCode"
            ref="input"
            v-model="state.totpCode"
            v-maska="'######'"
            type="text"
            class="form-input"
            placeholder="e.g. 123456"
            maxlength="6"
            @blur="v$.totpCode.$touch"
          />
          <p v-if="v$.totpCode.$errors.length" class="form-error-message">
            {{ v$.totpCode.$errors[0].$message }}
          </p>
        </div>
        <div class="text-center">
          <button
            id="mfaSubmit"
            type="submit"
            :disabled="authStore.status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Submit
            <font-awesome-icon v-if="authStore.status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          Back to
          <router-link id="moveToSignin" :to="{ name: RouteNames.SIGN_IN }" class="text-primary-500 hover:underline cursor-pointer">
            Sign In
          </router-link>
        </div>
        <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
      </form>
    </div>
  </div>
</template>
