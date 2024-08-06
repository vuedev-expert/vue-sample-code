<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  allowedSpecialChars: { type: Array as PropType<Array<string>>, default: () => [',', '.', '_', ' '] },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  isPhoneInput: { type: Boolean, default: false }
})
const emits = defineEmits(['update:modelValue', 'blur', 'focus'])

const regex = new RegExp(`[\\w${props.allowedSpecialChars.join('')}]`)
const phoneRegex = /[\d+\- ]/

const onInput = ($event: Event) => {
  const target = $event.target as HTMLInputElement
  emits('update:modelValue', target.value)
}
</script>

<template>
  <input
    v-maska="{ mask: 'W*', tokens: { 'W': { pattern: isPhoneInput ? phoneRegex : regex }}}"
    type="text"
    class="form-input"
    v-bind="$attrs"
    :value="modelValue"
    :disabled="disabled"
    @input="onInput"
    @blur="emits('blur', $event)"
    @focus="emits('focus', $event)"
  />
</template>
