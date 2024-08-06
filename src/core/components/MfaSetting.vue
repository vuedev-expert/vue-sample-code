<script lang="ts" setup>
import AppModal from '@/core/components/AppModal.vue'
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
const appModal = ref<InstanceType<typeof AppModal>>()

const emit = defineEmits(['close'])

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
    toDataURL(`otpauth://totp/${issuer}:${email}?secret=${_secretCode}&issuer=${issuer}`).then(
      (dataUrl) => (qrCode.value = dataUrl)
    )
  })
})

const onSubmit = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      verifySoftwareToken(
        authStore.user!.auth!.refreshToken!.token,
        state.value.code,
        authStore.user!.me.username
      ).then(
        () => {
          toast.success('Set-up two-factor authentication successfully.')
          resolve(true)
        },
        (err) => {
          console.log(err)
          reject(false)
        }
      )
    } else {
      reject(false)
    }
  })

const onFormSubmit = (event?: Event) => {
  event?.preventDefault()
  appModal.value?.onSubmit()
}
</script>

<template>
  <app-modal
    ref="appModal"
    title="Set up two-factor authentication using TOTP"
    ok-text="Submit"
    :on-ok="onSubmit"
    @close="(value: any) => emit('close', value)"
  >
    <template #body>
      <p>
        To activate two factor authentication using time-based one-time passwords, scan the QR code with your
        authentication app. If you don't have one, we recommend either
        <a
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
          target="_blank"
          >Google Authenticator</a
        >
        or <a href="https://authy.com/" target="_blank">Authy</a>.
      </p>
      <div class="my-5 flex justify-center">
        <img v-if="qrCode" :src="qrCode" alt="QR Code" />
      </div>
      <p>
        After scanning the code, enter the six digit code from your app to verify the setup. If you have problems
        scanning the QR code, do a manual setup with code <b>{{ secretCode }}</b>
      </p>
      <form class="mt-5" @submit="onFormSubmit">
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
      </form>
    </template>
  </app-modal>
</template>
