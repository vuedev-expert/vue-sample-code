<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { toDataURL } from 'qrcode'
import { minLength, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { useAuthStore } from '@/store/use-auth-store'
import { associateSoftwareToken, verifySoftwareToken } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'

interface QrCodeForm {
  code: string
}

interface SoftwareToken {
  secretCode: string
}

const authStore = useAuthStore()
const toast = useToast()

const qrCode = ref<string>('')
const secretCode = ref<string>('')
const isLoading = ref<boolean>(false)

const state = ref<QrCodeForm>({ code: '' })
const rules = computed(() => ({
  code: { required, minLengthValue: minLength(6) }
}))
const v$ = useVuelidate(rules, state)

onMounted(() => {
  associateSoftwareToken(authStore.user!.auth.refreshToken.token).then((data) => {
    const _secretCode = (data as unknown as SoftwareToken).secretCode
    const issuer = 'Project'
    const email = authStore.user!.me.email
    secretCode.value = _secretCode
    toDataURL(`otpauth://totp/${issuer}:${email}?secret=${_secretCode}&issuer=${issuer}`)
      .then(dataUrl => qrCode.value = dataUrl)
  })
})

const submitForm = async (event?: Event) => {
  event?.preventDefault()
  if (isLoading.value) return

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    isLoading.value = true
    try {
      await verifySoftwareToken(authStore.user!.auth!.refreshToken!.token, state.value.code, authStore.user!.me.username)
      await authStore.toFirstPage()
    } catch (e) {
      console.log(e)
    }
    isLoading.value = false
  }
}

</script>

<template>
  <div class="w-full flex-1 max-w-2xl">
    <img class="mb-8 mx-auto" src="https://lagislation-files.s3.ap-southeast-2.amazonaws.com/Project-logo.png" alt="Project Logo" />
    <div class="bg-base-white shadow-md rounded-lg relative p-6 md:p-10 overflow-hidden">
      <div class="text-2xl text-primary-500 font-semi-bold uppercase mb-8 text-center">2-Factor Authentication</div>
      <p>
        To activate two factor authentication using time-based one-time passwords, scan the QR code with your
        authentication app. If you don't have one, we recommend either <a
        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
        target="_blank">Google Authenticator</a> or <a href="https://authy.com/" target="_blank">Authy</a>.
      </p>
      <div class="my-5 flex justify-center">
        <img v-if="qrCode" :src="qrCode" alt="QR Code" />
      </div>
      <p>
        After scanning the code, enter the six digit code from your app to verify the setup. If you have problems
        scanning
        the QR code, do a manual setup with code <b>{{ secretCode }}</b>
      </p>
      <form class="mt-5" @submit="submitForm">
        <div class="form-item" :class="{ 'has-error': v$.code.$errors.length }">
          <input
            v-model="state.code"
            v-maska="'######'"
            type="text"
            class="form-input"
            placeholder="Code"
            maxlength="6"
            @blur="v$.code.$touch"
          />
          <p v-if="v$.code.$errors.length" class="form-error-message">
            {{ v$.code.$errors[0].$message }}
          </p>
        </div>
        <div class="text-center">
          <button
            type="submit"
            :disabled="isLoading"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
            @click="submitForm"
          >
            Submit
            <font-awesome-icon v-if="isLoading" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          Wrong account?
          <a
            id="logOutBtn"
            href="#"
            class="text-primary-500 hover:underline cursor-pointer"
            @click="$event.preventDefault(); authStore.logout()"
          >
            Sign Out
          </a>
        </div>
        <div class="absolute h-2 bg-primary-500 bottom-0 left-0 right-0"></div>
      </form>
    </div>
  </div>
</template>
