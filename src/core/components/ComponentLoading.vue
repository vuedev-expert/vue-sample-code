<script lang="ts" setup>
import { watch } from "vue";

const props = defineProps<{ loading: boolean }>()
watch(() => props.loading, (val) => {
  const bodyEle = document.getElementsByTagName('body')[0]
  if (val) bodyEle.style.overflow = 'hidden'
  else bodyEle.style.overflow = 'auto'
})

</script>
<template>
  <slot />
  <div v-if="props.loading" id="dotSpinner" class="absolute inset-0 w-full z-[1111] bg-base-white/60 flex items-center justify-center">
    <font-awesome-icon icon="spinner" class="fa-spin mr-2 fa-lg text-gray-600" />
  </div>
</template>
