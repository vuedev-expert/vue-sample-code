<script lang="ts" setup>
defineProps({
  title: { type: String },
  value: { type: Number }
})
</script>

<template>
  <div class="bg-base-white border-l-4 border-primary-500 rounded px-6 py-4 space-y-2">
    <div class="text-2xl text-primary-500">{{ value }}%</div>
    <div class="text-gray-500">{{ title }}</div>
  </div>
</template>

<style scoped></style>
