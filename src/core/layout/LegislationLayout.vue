<script lang="ts" setup>
import { legisMenu } from '@/core/models/menu.model'
import {useRoute} from "vue-router";

const emits = defineEmits(['renderView'])
const route = useRoute()

const routeCheck = (name :string) => {
  if (route.name === name) emits('renderView')
}
</script>

<template>
  <div class="container-xl h-full pb-6 flex flex-col">
    <slot name="header" />
    <div class="flex-1 flex flex-col bg-base-white rounded-lg shadow-md relative min-h-[200px]">
      <ul class="flex items-center divide-x divide-gray-300 px-1 md:px-3 py-8 gap-3 md:gap-0">
        <li v-for="item in legisMenu" :key="item.routeName" class="md:font-medium text-center">
          <router-link
              :id="item.id"
              v-slot="{ isActive }"
              :to="{ name: item.routeName }"
              @click="routeCheck(item.routeName)"
          >
            <span
                class="text-sm md:text-left text-primary-300 pl-2 md:px-3"
                :class="[isActive && 'active-view !text-primary-500 font-semibold']"
            >{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
      <slot />
    </div>
  </div>
</template>
