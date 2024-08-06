<script lang="ts" setup>
const props = defineProps({
  title: { type: String }
})
</script>
<template>
  <div class="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between mb-6">
    <div class="text-xl capitalize text-center md:text-left font-semibold text-primary-500 leading-9">
      {{ props.title }}
    </div>
    <div class="text-right space-x-2">
      <slot> </slot>
    </div>
  </div>
</template>
