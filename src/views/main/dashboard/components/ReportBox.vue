<script lang="ts" setup>
defineProps({
  title: { type: String }
})
</script>

<template>
  <div class="rounded-md px-6 py-6 bg-base-white flex flex-col">
    <h5 class="mb-5 font-bold">{{ title }}</h5>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
