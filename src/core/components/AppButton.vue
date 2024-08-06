<script lang="ts" setup>
import { ButtonType } from '@/core/models/common.model'
import { PropType } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: null },
  type: { type: String as PropType<ButtonType>, default: 'default' },
  class: { type: String, default: '' }
})

const emit = defineEmits(['click'])
</script>
<template>
  <button
    type="button"
    :disabled="props.loading || props.disabled"
    :class="[
      {
        'text-base-white bg-gray-500 disabled:bg-gray-400 hover:bg-gray-600 focus:ring-gray-300': props.type === 'dark',
        'text-base-white bg-primary-500 disabled:bg-primary-300 hover:bg-primary-700 focus:ring-primary-300':
          props.type === 'primary',
        'text-gray-700 bg-gray-200 disabled:bg-gray-100 hover:bg-gray-300 focus:ring-gray-400': props.type === 'light',
        'text-base-white bg-red-500 disabled:bg-red-300 hover:bg-red-700 focus:ring-red-100': props.type === 'danger',
        'text-gray-700  disabled:text-gray-500 hover:text-gray-900': props.type === 'default'
      },
      props.class
    ]"
    class="disabled:cursor-not-allowed disabled:text-opacity-60 transition-colors duration-200 focus:ring-2 font-medium rounded px-4 h-[36px] focus:outline-none"
    @click="emit('click')"
  >
    <font-awesome-icon v-if="props.loading" icon="spinner" class="fa-spin mr-2" />
    <font-awesome-icon v-if="!props.loading && props.icon" :icon="props.icon" class="mr-2" />
    <slot></slot>
  </button>
</template>
