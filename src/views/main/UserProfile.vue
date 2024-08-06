<script lang="ts" setup>
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { RoleNames } from '@/core/models/role.model'
import PageHeader from '@/core/components/PageHeader.vue'
import UserProfileEdit from './UserProfileEdit.vue'
import { computed, ref } from 'vue'
import UserResetPassword from './UserResetPassword.vue'

const authStore = useAuthStore()
const { me, userRole, avatarName } = storeToRefs(authStore)
const departmentString = computed(() => (me.value?.departments ?? []).map((d) => d.name).join(', '))
const locationString = computed(() => (me.value?.locations ?? []).map((d) => d.name).join(', '))
const isEditModal = ref(false)
const isChangePasswordModal = ref(false)

const onCloseProfileModal = (data?: any) => {
  // console.log('data', data)
  try {
    if (data && data.value && data.value.hasOwnProperty('firstName') && me.value) {
      me.value.firstName = data.value.firstName
      me.value.lastName = data.value.lastName
      me.value.phoneNumber = data.value.phoneNumber
    }
  } catch {
    console.log('Error in Profile')
  }

  isEditModal.value = false
}

const onCloseResetModal = (changed?: boolean) => {
  // console.log("changed",changed);
  isChangePasswordModal.value = false
}
</script>

<template>
  <UserProfileEdit v-if="isEditModal" :user="me" @close="onCloseProfileModal($event)"></UserProfileEdit>
  <UserResetPassword
    v-if="isChangePasswordModal"
    :username="me?.username"
    @close="onCloseResetModal()"
  ></UserResetPassword>
  <div class="h-full overflow-auto">
    <div class="container max-w-6xl px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-10 pb-6">
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-20">
        <div class="">
          <div
            class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-base-white uppercase tracking-widest"
          >
            {{ avatarName }}
          </div>
          <div class="text-xl font-bold mt-4">{{ me?.firstName }} {{ me?.lastName }}</div>
          <div class="mt-1 text-gray-500">{{ RoleNames[userRole?.name ?? ''] }}</div>
        </div>
        <div class="flex-1">
          <PageHeader title="Account Detail"></PageHeader>
          <div class="bg-base-white rounded-lg px-6 py-8 lg:p-10">
            <div class="space-y-8">
              <div>
                <button
                  type="button"
                  class="text-base-white bg-gray-500 float-right disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-gray-800"
                  @click="isEditModal = true"
                >
                  <font-awesome-icon icon="pen" class="mr-2"></font-awesome-icon>
                  Edit
                </button>
                <button
                  type="button"
                  class="mb-6 lg:mb-0 text-base-white float-right mr-3 bg-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded px-4 h-[36px] focus:outline-none dark:focus:ring-blue-800"
                  @click="isChangePasswordModal = true"
                >
                  <font-awesome-icon icon="lock" class="mr-2"></font-awesome-icon>
                  Change Password
                </button>
                <div class="uppercase text-gray-500 mb-6">General Information</div>
                <div class="space-y-4">
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">First Name:</span>
                    <span class="font-bold">{{ me?.firstName }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Last Name:</span>
                    <span class="font-bold">{{ me?.lastName }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Phone number:</span>
                    <span class="font-bold">{{ me?.phoneNumber }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Email:</span>
                    <span class="font-bold user-email">{{ me?.email }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Username:</span>
                    <span class="font-bold">{{ me?.username }}</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="uppercase font- text-gray-500 mb-6">Organisation</div>
                <div class="space-y-4">
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Role:</span>
                    <span class="font-bold">{{ RoleNames[userRole?.name ?? ''] }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Departments:</span>
                    <span class="font-bold">{{ departmentString }}</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="min-w-[140px]">Locations:</span>
                    <span class="font-bold">{{ locationString }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
