<script lang="ts" setup>
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, minLength, not, required, sameAs } from '@vuelidate/validators'
import { useAuthStore } from '@/store/use-auth-store'
import { PASSWORD_REGEX } from '@/core/constants/app-constants'
import { changeUserPassword } from '@/core/services/auth.services'
import { Status } from '@/core/models/common.model'
import { useToast } from "vue-toastification";

interface ResetPassword {
  username: string
  newPassword: string
  confirmedPassword: string
  oldPassword: string
}
const props = defineProps<{ username?: string }>()
const authStore = useAuthStore()
const toast = useToast()
const status = ref<Status>('idle')
let passHidden = ref<boolean>(true)
let newPassHidden = ref<boolean>(true)
let confirmNewPassHidden = ref<boolean>(true)

const state = ref<ResetPassword>({
  username: props.username ?? '',
  newPassword: '',
  confirmedPassword: '',
  oldPassword: ''
})

const rules = computed(() => ({
  username: { required },
  newPassword: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25),
    custom: helpers.withMessage(
      'Require at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
      helpers.regex(PASSWORD_REGEX)
    ),
    oldPassword: not(sameAs(state.value.oldPassword))
  },
  confirmedPassword: { required, sameAs: sameAs(state.value.newPassword) },
  oldPassword: {
    required,
    minLengthValue: minLength(8),
    maxLengthValue: maxLength(25)
  }
}))

const submitForm = async (event?: Event) => {
  event?.preventDefault()

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    status.value = 'loading'
    try {
      await changeUserPassword({
        oldPass: state.value.oldPassword,
        newPass: state.value.newPassword,
        confirmNewPass: state.value.confirmedPassword
      }).then((res) => {
        console.log('Pass changed ', res)
        toast.success('Password changed successfully!')
        authStore.logout()
      })
      .catch((err) => {
        console.log('err ', err)
      })
      status.value = 'idle'
    } catch (e) {
      status.value = 'error'
    }
  }
}
const v$ = useVuelidate(rules, state)
</script>

<template>
  <AppModal
    ref="appModal"
    :title="'Change Password '"
    :has-footer="false"
    width="450px"
    :can-dismiss="false"
    @close="false"
  >
    <template #body>
      <form @submit="submitForm">
        <div class="flex">
          <div class="form-item flex-1 mr-0" :class="{ 'has-error': v$.oldPassword.$errors.length }">
            <span class="form-label">Current Password</span>
            <div class="icon-appended-field">
              <input
                id="userOldPass"
                v-model="state.oldPassword"
                :type="passHidden ? 'password' : 'text'"
                class="form-input"
                placeholder="Enter your password"
                @blur="v$.oldPassword.$touch"
            />
              <font-awesome-icon :icon="passHidden?'eye':'eye-slash'" @click="passHidden = !passHidden"/>
            </div>
            <p v-if="v$.oldPassword.$errors.length" class="form-error-message multi-line">
              {{ v$.oldPassword.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex">
          <div class="form-item flex-1 mr-0" :class="{ 'has-error': v$.newPassword.$errors.length }">
            <span class="form-label">New Password</span>
            <div class="icon-appended-field">
              <input
                id="userNewPass"
                v-model="state.newPassword"
                :type="newPassHidden ? 'password' : 'text'"
                class="form-input"
                placeholder="Enter your new password"
                @blur="v$.newPassword.$touch"
            />
              <font-awesome-icon :icon="newPassHidden ?'eye':'eye-slash'" @click="newPassHidden = !newPassHidden"/>
            </div>
            <p v-if="v$.newPassword.$errors.length" class="form-error-message multi-line">
              {{ v$.newPassword.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex">
          <div class="form-item flex-1" :class="{ 'has-error': v$.confirmedPassword.$errors.length }">
            <span class="form-label">Confirm Password</span>
            <div class="icon-appended-field">
              <input
                id="userConfirmPass"
                v-model="state.confirmedPassword"
                :type="confirmNewPassHidden ? 'password' : 'text'"
                class="form-input"
                placeholder="Re-enter your password"
                @blur="v$.confirmedPassword.$touch"
              />
              <font-awesome-icon :icon="confirmNewPassHidden ?'eye':'eye-slash'" @click="confirmNewPassHidden = !confirmNewPassHidden"/>
            </div>
            <p v-if="v$.confirmedPassword.$errors.length" class="form-error-message mb-2">
              {{ v$.confirmedPassword.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="text-center">
          <button
            id="changePassBtn"
            type="submit"
            :disabled="status === 'loading'"
            class="text-base-white bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[42px] focus:outline-none dark:focus:ring-blue-800 mb-3"
          >
            Change Password
            <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="fa-spin ml-2" />
            <font-awesome-icon v-else icon="arrow-right" class="ml-2" />
          </button>
        </div>
      </form>
    </template>
  </AppModal>
</template>
