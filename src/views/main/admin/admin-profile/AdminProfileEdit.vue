<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { helpers, required, email } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { external } from '@/core/helpers/common'
import AppModal from '@/core/components/AppModal.vue'
import { updateSupportAdminProfile, fetchAdminInfo, changeUserPassword } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'

import { computed, ref } from 'vue'
import { UpdateSupportAdminProfilePayload } from '@/core/models/user.model'
import { emit } from 'process'

const toast = useToast()
const authStore = useAuthStore()
const isEdit = ref(false)
const appModal = ref<InstanceType<typeof AppModal>>()
const props = defineProps<{ user?: UpdateSupportAdminProfilePayload }>()

const state = ref<any | UpdateSupportAdminProfilePayload>({
  firstName: props?.user?.firstName ?? null,
  usrId: props?.user?.usrId ?? null,
  lastName: props?.user?.lastName ?? null,
  email: props?.user?.email ?? null,
  phoneNumber: props?.user?.phoneNumber ?? null
})

const emits = defineEmits(['close'])
const isPhoneNumberValid = ref<boolean>(false)

const rules = computed(() => ({
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phoneNumber: {
    required,
    custom: helpers.withMessage('Phone number is invalid', external(isPhoneNumberValid))
  },
  usrId: {}
}))

// console.log('props', props)
const v$ = useVuelidate(rules, state)
const onFormSubmit = (event?: Event) => {
  event?.preventDefault()
  appModal.value?.onSubmit()
}

defineExpose({ isPhoneNumberValid })
const formattedNumber = ref<string>(props.user?.phoneNumber ?? '')
const onInputPhoneNumber = (phone: any, phoneObject: { formatted: string; valid: boolean; number: string }) => {
  if (phoneObject?.formatted) {
    state.value.phoneNumber = phoneObject.number
    formattedNumber.value = phoneObject.formatted
    isPhoneNumberValid.value = phoneObject.valid
  }
}

const submit = async (event?: Event) => {
  event?.preventDefault()

  await v$.value.$validate()
  if (!v$.value.$invalid) {
    try {
      await updateSupportAdminProfile(props.user?.usrId, {
        firstName: state.value.firstName,
        lastName: state.value.lastName,
        email: state.value.email,
        phoneNumber: state.value.phoneNumber
      }).then(() => authStore.getUserProfile())
      emits('close', state)
      toast.success('Admin profile updated successfully')
    } catch (e) {
      toast.error('Admin profile not updated successfully')
    }
  }
}
</script>

<template>
  <AppModal
    ref="appModal"
    :title="'Edit Profile '"
    ok-text="Submit"
    width="450px"
    :on-ok="submit"
    :can-dismiss="false"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">Profile INFORMATION</div>
      <form @submit="onFormSubmit">
        <div class="flex flex-col">
          <div class="form-item flex-1" :class="{ 'has-error': v$.firstName.$errors.length }">
            <span class="form-label">First Name</span>
            <input id="userFirstName" type="text" class="form-input" v-model="state.firstName" placeholder="First Name" />
            <p v-if="v$.firstName.$errors.length" class="form-error-message">
              {{ v$.firstName.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1 mr-0" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Last Name</span>
            <input id="userLastName" type="text" class="form-input" v-model="state.lastName" placeholder="Last Name" />
            <p v-if="v$.lastName.$errors.length" class="form-error-message">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>

          <div v-if="false" class="form-item flex-1 mr-0" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Email</span>
            <input id="email" v-model="state.email" type="text" class="form-input" placeholder="Email" />
            <p v-if="v$.email.$errors.length" class="form-error-message">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex">
          <div class="form-item flex-1" :class="{ 'has-error': v$.phoneNumber.$errors.length }">
            <span class="form-label">Phone Number</span>
            <vue-tel-input
              id="userTelephone"
              :value="formattedNumber"
              :input-options="{ maxlength: 16, placeholder: 'Enter phone number' }"
              @blur="v$.phoneNumber.$touch"
              @input="onInputPhoneNumber"
            />
            <p v-if="v$.phoneNumber.$errors.length" class="form-error-message">
              {{ v$.phoneNumber.$errors[0].$message }}
            </p>
          </div>
        </div>
      </form>
    </template>
  </AppModal>
</template>
