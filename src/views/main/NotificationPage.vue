<script lang="ts" setup>
import { RouteNames } from '@/core/models/app-router.model'
import { AppNotification } from '@/core/models/notification.model'
import router from '@/router'
import { useNotificationStore } from '@/store/use-notification-store'
import { storeToRefs } from 'pinia'
import { formatDateTime } from '@/core/helpers/common'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { Switch } from '@headlessui/vue'
import { computed, onMounted, ref } from 'vue'
import UserAvatar from '@/core/components/UserAvatar.vue'

const notiStore = useNotificationStore()
const { notifications, count, status } = storeToRefs(notiStore)
const markAllAsRead = () => {
  notiStore.markAllAsRead()
}
const onNavigate = (item: AppNotification) => {
  if (item.status === 'UNREAD') {
    notiStore.markNotificationsAsRead([item.notId])
  }
  const module = item.metadata.module_name
  if (module === 'RISK') router.push({ name: RouteNames.RISK_MANAGEMENT })
  else if (module === 'ACTION') router.push({ name: RouteNames.ACTION_MANAGEMENT })
  else if (module === 'LEGISLATION_UPDATES') router.push({ name: RouteNames.LEGISLATION_UPDATES })
}
const unread = ref(false)

onMounted(() => {
  notiStore.getNotifications()
})

const filteredNotifications = computed(() => {
  return notifications.value.filter((n) => {
    return unread.value ? n.status === 'UNREAD' : true
  })
})
</script>
<template>
  <div class="container max-w-5xl h-full px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto pt-5 pb-6 flex flex-col">
    <div class="bg-base-white rounded-lg h-full flex flex-col">
      <div class="w-full px-6 py-6 flex items-center border-b border-gray-100 justify-between">
        <div class="text-2xl font-medium">Notifications</div>
        <div class="flex items-center">
          <span class="mr-2">Unread Only</span>
          <Switch
            v-model="unread"
            :class="!unread ? 'bg-gray-300' : 'bg-primary-500'"
            class="relative inline-flex h-6 w-11 items-center rounded-full"
          >
            <span class="sr-only">Enable notifications</span>
            <span
              :class="unread ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-base-white"
            />
          </Switch>
        </div>
      </div>
      <div v-if="filteredNotifications.length" class="w-full px-6 py-6 flex items-center justify-between">
        <div class="text-gray-600 uppercase">Today</div>
        <button
          v-if="count > 0"
          class="text-primary-500 hover:underline hover:text-primary-700 cursor-pointer transition-all duration-200"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>
      <div class="flex-1 overflow-auto relative">
        <template v-if="filteredNotifications.length">
          <div
            v-for="item in filteredNotifications"
            :key="item.notId"
            class="w-full px-6 py-6 flex cursor-pointer hover:bg-gray-100 items-start space-x-4"
            @click="onNavigate(item)"
          >
            <UserAvatar :user="item.fromUser" />
            <div class="flex-1 space-y-1">
              <div class="flex space-x-2">
                <span class="font-bold flex-1">{{ item.title }}</span>
                <span class="text-sm text-gray-600 ml-4">{{ formatDateTime(item.createdAt) }}</span>
              </div>
              <p>{{ item.content }}</p>
            </div>
            <span :class="{ 'opacity-0': item.status === 'READ' }" class="w-2 h-2 rounded-full bg-primary-500"></span>
          </div>
        </template>
        <div v-else class="px-4 py-4 h-32 flex items-center justify-center text-gray-500">
          {{ unread ? "You've read all your notifications from the last 30 days." : 'No Notifications' }}
        </div>
        <ComponentLoading :loading="status === 'loading'"></ComponentLoading>
      </div>
    </div>
  </div>
</template>
