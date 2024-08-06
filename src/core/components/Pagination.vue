<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

import { PaginationInfo, pageSizes } from '../models/table.model'

const range = (start: number, end: number) => {
  let length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

const DOTS = '...'

function getPaginationRange(pageInfo: PaginationInfo): any {
  const { total, pageSize, sibling, current } = pageInfo
  if (typeof pageSize === 'string') return false
  const totalPageCount = Math.ceil(total / pageSize)
  const totalPageNumbers = sibling + 5
  const firstPageIndex = 0
  const lastPageIndex = totalPageCount - 1

  if (totalPageNumbers >= totalPageCount) {
    return range(firstPageIndex, lastPageIndex)
  }

  const leftSiblingIndex = Math.max(current - sibling, firstPageIndex)
  const rightSiblingIndex = Math.min(current + sibling, lastPageIndex)
  const shouldShowLeftDots = leftSiblingIndex > firstPageIndex + 3
  const shouldShowRightDots = rightSiblingIndex < lastPageIndex - 3

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 4 + 2 * sibling
    const leftRange = range(firstPageIndex, leftItemCount - 1)
    const rightRange = range(lastPageIndex - 1, lastPageIndex)

    return [...leftRange, DOTS, ...rightRange]
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 4 + 2 * sibling
    const rightRange = range(lastPageIndex - rightItemCount + 1, lastPageIndex)
    const leftRange = range(firstPageIndex, firstPageIndex + 1)
    return [...leftRange, DOTS, ...rightRange]
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    const leftRange = range(firstPageIndex, firstPageIndex + 1)
    const rightRange = range(lastPageIndex - 1, lastPageIndex)
    return [...leftRange, DOTS, ...middleRange, DOTS, ...rightRange]
  }
}

const props = defineProps<{ pageInfo: PaginationInfo }>()
const pageInfo = ref(props.pageInfo)
const pageSizeArray = ref<(number|string)[]>([])
const selectedOption = ref<number|string>()

watch(
    () => props,
    () => {
      pageInfo.value = props.pageInfo
    }
)
watch(
    props.pageInfo,
    (val) => {
      if (!val.pageSize) selectedOption.value = 'All'
      else selectedOption.value = val.pageSize
    }
)
watch(props, () => {
      if (props.pageInfo.total >= 10) { // check if records are more than 30 (in every table)
        pageSizeArray.value = pageSizes // to enable view 'All' option
        if (!pageSizeArray.value.includes('All')) pageSizeArray.value.push('All')
      }
      else pageSizeArray.value = pageSizes
    }
)

const emits = defineEmits(['onPageChange'])

const pageItems = computed<any[]>(() => getPaginationRange(props.pageInfo))

const selectingOption = (item:any) => {
  selectedOption.value = item
  emits('onPageChange', { page: 0, pageSize: typeof item === 'string' ? null : item })
}
</script>
<template>
  <div class="flex space-x-6 items-center justify-end z-50">
    <ul v-if="pageInfo.total && pageItems?.length > 1 && pageInfo.pageSize" class="flex items-center space-x-4">
      <li>
        <button
            id="moveBackBtn"
            class="w-6 h-6 rounded-full hover:bg-gray-100 disabled:bg-opacity-0 disabled:text-gray-400 disabled:cursor-default"
            :disabled="pageInfo.current === 0"
            @click="() => emits('onPageChange', { page: pageInfo.current - 1, pageSize: pageInfo.pageSize })"
        >
          <font-awesome-icon icon="arrow-left" />
        </button>
      </li>
      <li v-for="(item, index) in pageItems" :key="index">
        <span v-if="item === DOTS" class="cursor-default">
          {{ item }}
        </span>
        <button
            v-else
            :id="`pageNo-${item+1}`"
            class="w-6 h-6 rounded-full"
            :class="[ item === pageInfo.current ? 'text-xs bg-primary-500 text-base-white cursor-default':'hover:bg-gray-100' ]"
            @click="() => item !== pageInfo.current && emits('onPageChange', { page: item, pageSize: pageInfo.pageSize })"
        >
          {{ item + 1 }}
        </button>
      </li>
      <li>
        <button
            id="moveNextBtn"
            class="w-6 h-6 rounded-full hover:bg-gray-100 disabled:bg-opacity-0 disabled:text-gray-400 disabled:cursor-default"
            :disabled="pageInfo.current === pageItems[pageItems?.length - 1]"
            @click="() => emits('onPageChange', { page: pageInfo.current + 1, pageSize: pageInfo.pageSize })"
        >
          <font-awesome-icon icon="arrow-right" />
        </button>
      </li>
    </ul>
    <Menu v-if="pageInfo.total" as="div" class="relative inline-block text-left bg-base-white">
      <MenuButton id="changePageSize">
        <div
            class="inline-flex justify-between z-[100] w-16 h-10 items-center rounded-sm transition-all duration-200 bg-base-white px-3 py-2 border border-gray-400 focus:outline-none"
        >
          <span class="mr-3">{{ selectedOption }} </span>
          <font-awesome-icon class="text-gray-500" icon="angle-down" />
        </div>
      </MenuButton>

      <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
            class="absolute bg-base-white w-16 py-2 left-0 mt-2 origin-bottom-left bottom-full rounded-md bg-white shadow-lg focus:outline-none"
        >
          <MenuItem
              v-for="item in pageSizeArray"
              :id="`pageOption-${item}`"
              :key="item"
              @click="selectingOption(item)"
          >
            <button
                class="w-full text-left space-x-4 px-6 hover:bg-gray-100 py-2 cursor-pointer"
                :class="{ 'bg-primary-500 text-base-white hover:bg-primary-500 !cursor-default' : selectedOption === item }"
            >
              {{ item }}
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
    <div class="text-gray-500">Total: {{ pageInfo.total }}</div>
  </div>
</template>
