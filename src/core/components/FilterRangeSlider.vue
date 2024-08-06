<script lang="ts" setup>
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
import { computed } from 'vue'
import Slider from '@vueform/slider'
const props = defineProps<{
  title: string
  modelValue: number[]
}>()
const min = 0
const max = 100
const value = computed(() => {
  if (!props.modelValue.length) return [min, max]
  return props.modelValue
})

const emits = defineEmits(['update:modelValue'])

const titleValue = computed(() => {
  if (value.value[0] === min && value.value[1] === max) return props.title
  return `${props.title} (${value.value[0]}-${value.value[1]})`
})
const hasValue = computed(() => {
  return value.value[0] > min || value.value[1] < max
})

const onChange = (value: number[]) => {
  if (value[0] === min && value[1] === max) emits('update:modelValue', [])
  else emits('update:modelValue', value)
}
</script>
<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex w-full h-10 items-center rounded-sm transition-all duration-200 bg-base-white px-4 py-2 hover:bg-gray-100 border border-gray-400 focus:outline-none"
        :class="{ 'border-primary-500 text-primary-500': hasValue }"
      >
        <span class="mr-2">{{ titleValue }} </span>
        <font-awesome-icon :class="{ ' text-primary-500': hasValue }" class="text-gray-500" icon="angle-down" />
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
        class="absolute z-50 left-0 mt-2 w-56 origin-top-left bg-base-white rounded-md bg-white shadow-lg focus:outline-none"
      >
        <div class="px-6 pt-16 pb-6">
          <Slider v-model="value" @change="onChange"></Slider>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
<style src="@vueform/slider/themes/default.css"></style>
