<script lang="ts" setup>
import { USERNAME_REGEX } from '@/core/constants/app-constants'
import {AddTempUserPayload, OrgUser, UpdateUserPayload} from '@/core/models/user.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { email, helpers, maxLength, minLength, required } from '@vuelidate/validators'
import {computed, onMounted, ref} from 'vue'
import { external } from '@/core/helpers/common'
import useVuelidate from '@vuelidate/core'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { storeToRefs } from 'pinia'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { RoleNames } from '@/core/models/role.model'
import {useAuthStore} from "@/store/use-auth-store";
import {RouteNames} from '@/core/models/app-router.model'

interface FormState {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  locIds: string[]
  depIds: string[]
  rolId: string | null
}
const locationsStore = useOrgLocationStore()
const departmentsStore = useOrgDepartmentStore()
const _userSetupStore = useUserSetupStore()
const authStore = useAuthStore()

const { locations } = storeToRefs(locationsStore)
const { departments } = storeToRefs(departmentsStore)
const { listRoles } = storeToRefs(_userSetupStore)
const { isLitePlanSubscribed, usersInCurrentPlan } = storeToRefs(authStore)

const emits = defineEmits(['close', 'show-user-exceed-modal'])

const state = ref<FormState>({
  firstName: '',
  lastName: '',
  email: '',
  locIds: [],
  depIds: [],
  username: '',
  rolId: null,
  phoneNumber: ''
})

const userTypes = ['Temporary', 'Permanent']
const isPhoneNumberValid = ref<boolean>(false)
const selectedUSerRole = ref('Temporary')
const rules = computed(() => ({
  firstName: { required },
  lastName: { required },
  email: { required, email },
  username: {
    required: selectedUSerRole.value === 'Temporary' ? false : required,
    minLengthValue: selectedUSerRole.value === 'Temporary' ? false : minLength(8),
    maxLengthValue: selectedUSerRole.value === 'Temporary' ? false : maxLength(25),
    custom: selectedUSerRole.value === 'Temporary' ? false : helpers.withMessage('Invalid username format', helpers.regex(USERNAME_REGEX))
  },
  rolId: {
    required: selectedUSerRole.value === 'Temporary' ? false : required
  },
  phoneNumber: {
    required: selectedUSerRole.value === 'Temporary' ? false : required,
    custom: selectedUSerRole.value === 'Temporary' ? false : helpers.withMessage('Phone number is invalid', external(isPhoneNumberValid))
  },
}))
const v$ = useVuelidate(rules, state)
defineExpose({ isPhoneNumberValid })

onMounted(() => {
  _userSetupStore.getRoles()
})

const formattedNumber = ref<string>('')
const onInputPhoneNumber = (phone: any, phoneObject: { formatted: string; valid: boolean; number: string }) => {
  if (phoneObject?.formatted) {
    state.value.phoneNumber = phoneObject.number
    formattedNumber.value = phoneObject.formatted
    isPhoneNumberValid.value = phoneObject.valid
  }
}

let superAdminSelected = ref<boolean>(false)
const superAdminCheck = (val :any) => {
  if (val.name === 'SUPER_ADMIN') {
    superAdminSelected.value = true
    state.value.locIds = locations.value.map((loc) => loc.locId)
    state.value.depIds = departments.value.map((dept) => dept.depId)
  } else {
    superAdminSelected.value = false
    state.value.locIds = []
    state.value.depIds = []
  }
}

const userExceedModal = ref<Boolean>(false)
const submit = () =>
    new Promise((resolve, reject) => {
        v$.value.$validate()
        if (!v$.value.$invalid) {
          if (selectedUSerRole.value === 'Temporary') {
            _userSetupStore.addTempUser(state.value as unknown as AddTempUserPayload)
                .then(async () => {
                  await _userSetupStore.getTempUserList()
                  resolve(true)
                })
                .catch(() => reject())
          } else {
            _userSetupStore.addUser(state.value)
                .then(async () => {
                  await _userSetupStore.getUserList({}, true)
                  resolve(true)
                })
                .catch((err) => {
                  if (err?.response?.data?.message === 'Users exceeded.') userExceedModal.value = true
                  reject()
                })
          }
        } else reject()
    })
</script>

<template>
  <AppModal
      :title="`Add ${selectedUSerRole?selectedUSerRole:''} User`"
      ok-text="Add"
      ok-icon="save"
      :can-dismiss="false"
      :on-ok="submit"
      @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1 mb-2 md:mb-6" :class="{ 'has-error': v$.firstName.$errors.length }">
            <span class="form-label">First Name</span>
            <lah-input id="userFirstName" v-model="state.firstName" placeholder="First Name" @blur="v$.firstName.$touch" />
            <p v-if="v$.firstName.$errors.length" class="form-error-message">
              {{ v$.firstName.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1 mb-5" :class="{ 'has-error': v$.lastName.$errors.length }">
            <span class="form-label">Last Name</span>
            <lah-input id="userLastName" v-model="state.lastName" placeholder="Last Name" @blur="v$.lastName.$touch" />
            <p v-if="v$.lastName.$errors.length" class="form-error-message">
              {{ v$.lastName.$errors[0].$message }}
            </p>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1 mb-2 md:mb-6" :class="{ 'has-error': v$.email.$errors.length }">
            <span class="form-label">Email</span>
            <lah-input
                id="userEmail"
                v-model="state.email"
                :allowed-special-chars="['@', '.', '+', '_', '-']"
                type="email"
                placeholder="Email"
                @blur="v$.email.$touch"
            />
            <p v-if="v$.email.$errors.length" class="form-error-message">
              {{ v$.email.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item flex-1 mb-2 md:mb-6">
            <span class="form-label">User Type</span>
            <vue-select
                id="userRole"
                v-model="selectedUSerRole"
                :options="userTypes"
                placeholder="Select User Type"
            />
          </div>
        </div>

        <div v-if="selectedUSerRole === 'Permanent'">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-item flex-1 mb-5" :class="{ 'has-error': v$.username.$errors.length }">
              <span class="form-label">User Name</span>
              <lah-input
                  id="userUsername"
                  v-model="state.username"
                  :allowed-special-chars="[]"
                  placeholder="Username"
                  @blur="v$.username.$touch"
              />
              <p v-if="v$.username.$errors.length" class="form-error-message">
                {{ v$.username.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1 mb-2 md:mb-6" :class="{ 'has-error': v$.rolId.$errors.length }">
              <span class="form-label">Role</span>
              <vue-select
                  id="userRole"
                  v-model="state.rolId"
                  :options="listRoles"
                  :reduce="(role: any) => role.rolId"
                  label="name"
                  placeholder="Select Role"
                  @option:selected="superAdminCheck"
                  @search:blur="v$.rolId.$touch"
              >
                <template #selected-option="{ name }">
                  {{ RoleNames[name] }}
                </template>
                <template #option="{ name }">
                  {{ RoleNames[name] }}
                </template>
              </vue-select>
              <p v-if="v$.rolId.$errors.length" class="form-error-message">
                {{ v$.rolId.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-item flex-1 mb-5" :class="{ 'has-error': v$.phoneNumber.$errors.length }">
              <span class="form-label">Phone Number</span>
              <vue-tel-input
                  id="userPhoneNumber"
                  :value="formattedNumber"
                  :input-options="{ maxlength: 16, placeholder: 'Enter phone number' }"
                  @blur="v$.phoneNumber.$touch"
                  @input="onInputPhoneNumber"
              />
              <p v-if="v$.phoneNumber.$errors.length" class="form-error-message">
                {{ v$.phoneNumber.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1 mb-2">
              <span class="form-label">Locations</span>
              <vue-select
                  id="userLocs"
                  v-model="state.locIds"
                  :options="locations"
                  :reduce="(loc: any) => loc.locId"
                  label="name"
                  multiple
                  placeholder="Select Locations"
                  class="inside-scroll-modal"
                  :disabled="superAdminSelected"
              />
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-item flex-1 mb-2">
              <span class="form-label">Departments</span>
              <vue-select
                  id="userDepts"
                  v-model="state.depIds"
                  :options="departments"
                  :reduce="(dep: any) => dep.depId"
                  label="name"
                  multiple
                  placeholder="Select Departments"
                  class="inside-scroll-modal"
                  :disabled="superAdminSelected"
              />
            </div>
            <div class="flex-1"/>
          </div>
        </div>
      </form>
    </template>
  </AppModal>

  <AppModal
      v-if="userExceedModal"
      width="460px"
      :has-footer="false"
      :can-dismiss="false"
      :is-header-less="true"
      @close="userExceedModal = false"
  >
    <template #body>
      <div class="text-center">
        <h2 class="font-bold text-primary-500 mb-2 text-2xl">Caution</h2>
        <p class="mb-3">{{ isLitePlanSubscribed && usersInCurrentPlan < 4 ? 'Add Payment to add more users.' : 'Maximum Numbers of users reached.' }}</p>
        <p v-if="!isLitePlanSubscribed" class="mb-5">Select the below button to upgrade your plan</p>
        <AppButton id="upgradePlanBtn" type="primary" class="mb-4" @click="$router.push({ name: RouteNames.UPDATE_SUBSCRIPTION })">
          {{ isLitePlanSubscribed && usersInCurrentPlan < 4?'Add more users':'Upgrade plan' }}</AppButton>
      </div>
    </template>
  </AppModal>
</template>
