<script lang="ts" setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { computed, ref, watch } from 'vue'
import { FilterDropDownItem } from '../models/common.model.js'

const props = defineProps({
  items: {
    type: Array<FilterDropDownItem>,
    default: []
  },
  title: { type: String, default: 'Select Item' },
  modelValue: { type: Array<string>, default: [] },
  hasSearch: { type: Boolean, default: false },
  single: { type: Boolean, default: false },
  width: { type: Number, default: 200 },
  clearable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  notSorted: { type: Boolean, default: false }
})

const emits = defineEmits(['onChange', 'update:modelValue'])
const selectedItems = ref<(string | number)[]>(props.modelValue)

const filteredItems = computed(() => {
  let sortedItems = []
  if (props.notSorted) sortedItems = props.items
  else sortedItems = [...props.items].sort((a, b) => a.name.localeCompare(b.name))
  if (!search.value) return sortedItems
  return sortedItems.filter((i) => i.name.toLowerCase().includes(search.value.toLowerCase().trim()))
})

watch(
  () => props.modelValue,
  () => {
    selectedItems.value = props.modelValue instanceof Array ? props.modelValue : [];
  }
)

const search = ref<string>('')

const getTitle = computed(() => {
  if (props.single) {
    if (selectedItems.value.length) {
      const item = props.items.find((s) => s.id === selectedItems.value[0])
      return item ? item.name : ''
    }
    return props.title
  }
  return props.title + (selectedItems.value.length ? ' (' + selectedItems.value.length + ')' : '')
})

const selectSingleItem = (id: string | number) => {
  selectedItems.value = [id]
  updateChange()
}

const toggleSelect = (event: any) => {
  if (event.target.checked) {
    selectedItems.value = [...props.items].map((i) => i.id)
  } else selectedItems.value = []
  updateChange()
}
const checkItem = (event: any, id: string | number) => {
  if (event.target.checked) {
    selectedItems.value.push(id)
  } else selectedItems.value = selectedItems.value.filter((i) => i !== id)
  updateChange()
}

const updateChange = () => {
  emits('update:modelValue', selectedItems.value)
  emits('onChange', selectedItems.value)
}

const onClear = () => {
  selectedItems.value = []
  updateChange()
}

const handleSpaceKeydown=(event:any) => {
    if (event.key === ' ') {
      event.stopPropagation(); // Prevent event from bubbling up
    }
}

const isSelectAll = computed(() => {
  return !!selectedItems.value.length && selectedItems.value.length === props.items.length
})
</script>
<template>
  <Menu :id="`${props.title}Filter`" as="div" @click="search = ''" class="relative inline-block text-left bg-base-white">
    <MenuButton :id="`${getTitle?.replace(/\s/g, '')}Filter`" :disabled="props.disabled">
      <div
        class="inline-flex w-full h-10 items-center rounded-sm transition-all duration-200 bg-base-white pl-4 pr-3 py-2 border border-gray-400 focus:outline-none"
        :class="{ 'border-primary-500 text-primary-500': selectedItems.length, '!bg-gray-50': props.disabled }"
      >
        <span class="mr-3 font-normal" :class="{ '!text-gray-400': props.disabled }">{{ getTitle }} </span>
        <font-awesome-icon
          v-if="!selectedItems.length || !props.clearable"
          :class="{ ' text-primary-500': selectedItems.length }"
          class="text-gray-500"
          icon="angle-down"
        />
        <span
          v-if="props.clearable && selectedItems.length"
          class="w-5 h-5 cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100"
          @click.stop="onClear"
        >
          <font-awesome-icon class="text-gray-500" icon="times" />
        </span>
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
        :style="{ width: props.width + 'px' }"
        class="absolute z-[999] bg-base-white py-2 left-0 mt-2 origin-top-left rounded-md bg-white shadow-lg focus:outline-none filter-dropdown"
      >
        <div v-if="props.hasSearch" class="px-2 py-2">
          <input v-model="search" type="text" placeholder="Search" @keydown.space="handleSpaceKeydown" class="form-input search-dropdown pr-8" />
        </div>
        <template v-if="filteredItems.length">
          <template v-if="props.single">
            <template v-for="item in filteredItems" :key="item.id">
              <MenuItem v-if="!item.hidden" @click="selectSingleItem(item.id)">
                <button class="w-full text-left space-x-4 px-6 hover:bg-gray-100 py-2 cursor-pointer">
                  {{ item.name }}
                </button>
              </MenuItem>
            </template>
          </template>
          <template v-else>
            <div class="flex items-center space-x-4 px-4 py-2">
              <input :checked="isSelectAll" type="checkbox" class="form-checkbox" @change="toggleSelect" />
              <span class="font-bold">Select All</span>
            </div>
            <template v-for="item in filteredItems" :key="item.id">
              <div v-if="!item.hidden" class="flex items-center space-x-4 px-4 py-2">
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(item.id)"
                  class="form-checkbox"
                  @change="(event: any) => checkItem(event, item.id)"
                />
                <div :class="[selectedItems.includes(item.id) ? 'font-bold' : '']">{{ item.name }}</div>
              </div>
            </template>
          </template>
        </template>
        <div v-else class="text-center px-2 py-4 text-gray-500">No Item Available</div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<style scoped>
.search-dropdown {
  height: 2.2rem;
  padding-left: .7rem;
}
</style>
