<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { helpers, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { external } from '@/core/helpers/common'
import AppModal from '@/core/components/AppModal.vue'
import { updateUserProfile, changeUserPassword } from '@/core/services/auth.services'
import { useToast } from 'vue-toastification'

import { computed, ref } from 'vue'
import { UpdateProfilePayload } from '@/core/models/user.model'
import { emit } from 'process'

const toast = useToast()
const isEdit = ref(false)
const appModal = ref<InstanceType<typeof AppModal>>()
const props = defineProps<{ user?: UpdateProfilePayload }>()

const state = ref<any | UpdateProfilePayload>({
  firstName: props?.user?.firstName ?? null,
  usrId: props?.user?.usrId ?? null,
  lastName: props?.user?.lastName ?? null,
  phoneNumber: props?.user?.phoneNumber ?? null
})

const emits = defineEmits(['close'])
const isPhoneNumberValid = ref<boolean>(false)

const rules = computed(() => ({
  firstName: { required },
  lastName: { required },
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
      await updateUserProfile(props.user?.usrId, {
        firstName: state.value.firstName,
        lastName: state.value.lastName,
        phoneNumber: state.value.phoneNumber
      })
      emits('close', state)
      toast.success('User profile updated successfully')
    } catch (e) {
      // toast.success('User profile not updated successfully')
    }
  }
}
</script>

<template>
  <AppModal
    ref="appModal"
    :title="'Edit Profile '"
    ok-text="Submit"
    :on-ok="submit"
    width="768px"
    :can-dismiss="false"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">Profile INFORMATION</div>
      <form @submit="onFormSubmit">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1 mb-1 md:mb-6" :class="{ 'has-error': v$.firstName.$errors.length }">
            <span class="form-label">First Name</span>
            <input id="userFirstName" type="text" class="form-input" v-model="state.firstName" placeholder="First Name" />
            <p v-if="v$.firstName.$errors.length" class="form-error-message">
              {{ v$.firstName.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item flex-1" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Last Name</span>
            <input id="userLastName" type="text" class="form-input" v-model="state.lastName" placeholder="Last Name" />
            <p v-if="v$.lastName.$errors.length" class="form-error-message">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex flex-col md:flex-row">
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
          <div class="form-item flex-1"></div>
        </div>
      </form>
    </template>
  </AppModal>
</template>
