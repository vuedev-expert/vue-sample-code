<template>
  <div class="flex-1 max-w-md">
    <img class="mb-8 mx-auto" src="https://aws-s3-pathap-southeast-2.amazonaws.com/Project-logo.png" alt="Project logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-6 md:p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">Sign In</div>
      <form @submit="submitForm">
        <div class="form-item" :class="{ 'has-error': v$.username.$errors.length }">
          <span class="form-label">Username</span>
          <lah-input
            id="usernameField"
            v-model="state.username"
            :allowed-special-chars="[]"
            placeholder="Enter your username"
            @blur="v$.username.$touch"
          />
          <p v-if="v$.username.$errors.length" class="form-error-message">
            {{ v$.username.$errors[0].$message }}
          </p>
        </div>
        <div class="form-item" :class="{ 'has-error': v$.password.$errors.length }">
          <span class="form-label">Password</span>
          <div class="icon-appended-field">
            <input
              id="passField"
              v-model="state.password"
              :type="passHidden ? 'password' : 'text'"
              class="form-input"
              placeholder="Enter your password"
              @blur="v$.password.$touch"
          />
            <font-awesome-icon :icon="passHidden?'eye':'eye-slash'" @click="passHidden = !passHidden" />
          </div>
          <p v-if="v$.password.$errors.length" class="form-error-message">
            {{ v$.password.$errors[0].$message }}
          </p>
        </div>
        <div class="flex items-center justify-between w-full mb-8">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
            />
            <span class="ml-2 text-gray-500">Remember me</span>
          </label>
          <router-link
            id="forgotPass"
            :to="{ name: RouteNames.FORGOT_PASSWORD }"
            class="text-primary-500 hover:underline cursor-pointer"
          >
            Forgot Password?
          </router-link>
        </div>
        <div class="text-center">
          <button
            id="signInBtn"
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Sign In
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          Don't have account?
          <router-link id="moveToSignup" :to="{ name: RouteNames.SIGN_UP }" class="text-primary-500 hover:underline cursor-pointer">
            Create one
          </router-link>
        </div>

        <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { maxLength, minLength, required } from '@vuelidate/validators'
import { RouteNames } from '@/core/models/app-router.model'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import LahInput from '@/core/components/LahInput.vue'

interface SignIn {
  username: string
  password: string
}

const authStore = useAuthStore()

const { status } = storeToRefs(authStore)
let passHidden = ref<boolean>(true)
const state = ref<SignIn>({
  username: '',
  password: ''
})
const rules = computed(() => ({
  username: { required },
  password: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25)
  }
}))

const submitForm = (event?: Event) => {
  event?.preventDefault()

  v$.value.$validate()
  if (!v$.value.$invalid) {
    authStore.signIn(state.value)
  }
}
const v$ = useVuelidate(rules, state)
</script>
