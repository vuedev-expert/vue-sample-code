<script lang="ts" setup>
import { Switch } from '@headlessui/vue'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Boolean, default: false },
  disable: { type: Boolean, default: false }
})

watch(() => props.value, (newValue) => {
  enabled.value = newValue
})

const enabled = ref(props.value)
watch(enabled, () => {
  emits('onChange', enabled.value)
})
const emits = defineEmits(['onChange', 'update:modelValue'])
</script>
<template>
  <Switch
    v-model="enabled"
    :class="[!enabled ? 'bg-gray-300' : 'bg-primary-500',props?.disable ? 'pointer-events-none' : '']"
    class="relative inline-flex h-6 w-11 items-center rounded-full mt-2 "
  >
    <span class="sr-only"></span>
    <span
      :class="enabled ? 'translate-x-6' : 'translate-x-1'"
      class="inline-block h-4 w-4 transform rounded-full bg-base-white"
    />
  </Switch>
</template>
