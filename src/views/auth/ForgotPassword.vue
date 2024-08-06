<template>
  <div class="w-full flex-1 max-w-md">
    <img class="mb-8 mx-auto" src="Project-logo.png" alt="Project Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-6 md:p-10 overflow-hidden">
      <form @submit="submitForm">
        <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">Forgot Password</div>
        <div class="text-center mb-5">
          <span>Enter your username and we will send you the verification code to reset your password</span>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.username.$errors.length }">
          <span class="form-label">Username</span>
          <lah-input
            id="userNameField"
            v-model="state.username"
            placeholder="Enter your username"
            :allowed-special-chars="[]"
            @blur="v$.username.$touch"
          />
          <p v-if="v$.username.$errors.length" class="form-error-message">
            {{ v$.username.$errors[0].$message }}
          </p>
        </div>
        <div class="text-center">
          <button
            id="submitBtn"
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Submit
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
      </form>

      <div class="text-center text-sm text-gray-500">
        Back to
        <router-link id="moveToSignin" :to="{ name: route.meta?.adminAuth ? AdminRouteNames.ADMIN_SIGN_IN : RouteNames.SIGN_IN }" class="text-primary-500 hover:underline cursor-pointer">
          Sign In
        </router-link>
      </div>

      <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'
import { useAuthStore } from "@/store/use-auth-store";
import { RouteNames, AdminRouteNames} from '@/core/models/app-router.model'
import { Status } from '@/core/models/common.model'
import { forgotPassword, adminForgotPassword } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'
import { useRouter, useRoute } from 'vue-router'
import { USERNAME_REGEX } from '@/core/constants/app-constants'
import LahInput from '@/core/components/LahInput.vue'
import {storeToRefs} from "pinia";

interface ForgotPassword {
  username: string
}

const authStore = useAuthStore()

const { isSupportAdmin } = storeToRefs(authStore)

const toast = useToast()
const router = useRouter()
const route = useRoute()
const status = ref<Status>('idle')

const state = ref<ForgotPassword>({
  username: ''
})

const rules = computed(() => ({
  username: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage('Invalid username format', helpers.regex(USERNAME_REGEX))
  }
}))

const submitForm = async (event?: Event) => {
  event?.preventDefault()

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    status.value = 'loading'
    try {
      if (route.meta?.adminAuth) await adminForgotPassword(state.value)
      else await forgotPassword(state.value)
      status.value = 'idle'
      toast.success('We have e-mailed your password reset code')
      await router.push({
        name: route.meta?.adminAuth ? AdminRouteNames.ADMIN_RESET_PASSWORD : RouteNames.RESET_PASSWORD,
        query: { username: state.value.username }
      })
    } catch (e) {
      status.value = 'error'
    }
  }

  return false
}
const v$ = useVuelidate(rules, state)
</script>
