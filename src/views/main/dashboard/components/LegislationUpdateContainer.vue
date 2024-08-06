<script setup lang="ts">
import { RouteNames } from '@/core/models/app-router.model'
import {formatDate, getLatestModifiedDate} from "@/core/helpers/common";
import {computed} from "vue";

const props = defineProps<{ updatedLegislationList: any[] }>()

const legislationList = computed(() => props.updatedLegislationList.slice(0, 5))
</script>

<template>
  <div class="bg-[#ffffff] rounded-lg px-5 py-6 flex flex-col h-[355px] 2xl:h-[475px]" style="box-shadow: 0 4px 20px rgba(13, 10, 44, 0.08);">
    <div class="flex justify-between gap-5 text-primary-500 mb-3 2xl:text-xl">
      <h3 class="font-bold">
        Announcements - Latest Legal Updates
      </h3>

      <RouterLink :to="{ name: RouteNames.LEGISLATION_UPDATES_LIBRARY  }">
        <font-awesome-icon
            icon="fa-solid fa-arrow-up-right-from-square"
            class="cursor-pointer transition-all hover:scale-110"
        />
      </RouterLink>
    </div>

    <ul v-if="legislationList.length" class="updated-legislations-list flex flex-col gap-2 text-gray-500 text-xs 2xl:text-base">
      <template v-for="(legislation, i) in legislationList" :key="legislation.legActId">
        <li :class="{'border-b border-gray-400 pb-1.5' : legislationList.length - 1 !== i }">
          {{ legislation.name }} has been updated on {{ getLatestModifiedDate(legislation.updatedOrgActHistories) }}
        </li>
      </template>
    </ul>
    <p v-else class="flex justify-center items-center h-full px-4 text-center py-20">
      No Updates! We'll notify you once we receive an update
    </p>
  </div>
</template>

<style scoped>

</style>
