<script lang="ts" setup>
import { homeMenu, settingMenu } from '../models/menu.model'
import { useRouter } from 'vue-router'
import { Menu, MenuItems, MenuButton, MenuItem } from '@headlessui/vue'
import { RouteNames, AdminRouteNames } from '@/core/models/app-router.model'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import Notification from './Notification.vue'
import { computed } from 'vue'
import { hasPermission, hasRole } from '../helpers/common'
import { AppPermission } from '../models/permission.model'

const authStore = useAuthStore()

const { hasPayment, avatarName, isSupportAdmin } = storeToRefs(authStore)
const router = useRouter()

const homeMenuWithPermission = computed(() => {
  return [...homeMenu].map((item) => ({
    ...item,
    isShow: hasPermission(item.permissions || []) && hasRole(item.roles ?? [])
  }))
})

const signout = () => authStore.logout()

const toggleSidebar = () => {
  let sidebar
  if (isSupportAdmin.value) sidebar = document.getElementById('sideBarAdmin')
  else sidebar = document.getElementById('sideBar')
  if(sidebar?.classList.contains('show')) {
    sidebar.classList.remove('show')
    sidebar.classList.add('hidden')
  }
  else {
    sidebar?.classList.add('show')
    sidebar?.classList.remove('hidden')
  }
}
</script>

<template>
  <header class="z-[9999] py-5 bg-base-white sticky top-0">
    <div class="flex items-center justify-between h-full px-4 md:px-12 mx-auto text-purple-600 dark:text-purple-300">
      <img
          v-if="isSupportAdmin"
          class="hidden md:block w-auto"
          style="padding-left: 1.7rem; height: 44px"
          src="@/assets/imgs/admin-logo.png"
          alt="Project Logo"
      />
      <img
          v-else
          class="hidden md:block w-auto"
          style="padding-left: 1.7rem; height: 44px"
          src="https://aws-s3-pathap-southeast-2.amazonaws.com/Project-logo.png"
          alt="Project Logo"
      />
      <button @click="toggleSidebar" data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center text-sm text-black-500 rounded-lg md:hidden" aria-controls="navbar-default" aria-expanded="false">
        <span class="sr-only">Open Sidebar</span>
        <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
      </button>
      <!--      <ul v-if="hasPayment" class="flex items-center flex-shrink-0 mx-auto">-->
      <!--        <li v-for="item in homeMenuWithPermission" v-show="!!item.isShow" :key="item.label">-->
      <!--          <router-link v-slot="{ href, navigate, isExactActive, isActive }" custom :to="{ name: item.routeName }">-->
      <!--            <a-->
      <!--              :href="href"-->
      <!--              class="font-medium px-6 py-2 rounded"-->
      <!--              :class="[-->
      <!--                ((isExactActive || isActive) && 'text-base-white bg-primary-500 font-semibold') || 'text-gray-800 '-->
      <!--              ]"-->
      <!--              @click="navigate"-->
      <!--            >-->
      <!--              {{ item.label }}-->
      <!--            </a>-->
      <!--          </router-link>-->
      <!--        </li>-->
      <!--      </ul>-->
      <ul class="ml-auto flex items-center flex-shrink-0 space-x-5 md:space-x-8">
        <template v-if="hasPayment">
          <!-- Profile menu -->
          <li v-if="hasPermission([AppPermission.ORGANISATION_ADMIN])">
            <Menu as="div" class="relative inline-block text-left">
              <div>
                <MenuButton
                  class="text-dark transition-colors duration-200 focus:shadow-outline-purple focus:outline-none"
                >
                  <font-awesome-icon icon="gear" class="w-[20px] h-[20px]" />
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems
                  class="absolute bg-base-white overflow-hidden text-[15px] w-[180px] right-0 mt-[5px] py-[5px] origin-top-right rounded-md shadow-lg focus:outline-none"
                >
                  <MenuItem
                    v-for="item in settingMenu"
                    v-show="hasPermission(item.permissions ?? [])"
                    :key="item.label"
                    v-slot="{ active }"
                  >
                    <div
                      :class="[
                        `${item.id}`,
                        active ? 'bg-primary-500 text-base-white' : 'text-gray-700',
                        'group flex cursor-pointer w-full items-center px-[14px] py-[10px]'
                      ]"
                      @click="router.push({ name: item.routeName })"
                    >
                      {{ item.label }}
                    </div>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </li>
          <li>
            <Notification></Notification>
          </li>
        </template>

        <li>
          <Menu id="profileDD" as="div" class="relative inline-block text-left">
            <div>
              <MenuButton
                class="text-primary-500 transition-colors duration-200 focus:shadow-outline-purple focus:outline-none"
              >
                <div
                  class="text-base-white w-[30px] h-[30px] text-[12px] flex-shrink-0 uppercase flex items-center justify-center font-semibold tracking-widest rounded-full"
                  style="background: #343a40"
                >
                  {{ avatarName }}
                </div>
              </MenuButton>
            </div>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems
                class="absolute bg-base-white overflow-hidden text-[15px] w-[180px] right-0 mt-[5px] py-[5px] origin-top-right rounded-md shadow-lg focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <div
                    :class="[
                      'profile-link',
                      active ? '!bg-primary-500 !text-base-white' : 'text-gray-700',
                      'group flex cursor-pointer w-full items-center px-[14px] py-[10px]'
                    ]"
                    @click="isSupportAdmin ? router.push({ name: AdminRouteNames.USER_PROFILE }) : router.push({ name: RouteNames.USER_PROFILE })"
                  >
                    <font-awesome-icon icon="user" class="mr-4"></font-awesome-icon>
                    Profile
                  </div>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      'sign-out-btn',
                      active ? '!bg-primary-500 !text-base-white' : 'text-gray-700',
                      'group flex cursor-pointer w-full items-center px-4 py-3'
                    ]"
                    @click="signout"
                  >
                    <font-awesome-icon icon="right-from-bracket" class="mr-4"></font-awesome-icon>
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </li>
      </ul>
    </div>
  </header>
</template>
