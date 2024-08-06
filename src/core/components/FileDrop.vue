<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  multiple: { type: Boolean, default: true },
  fileSize: { type: Number, default: 5 }
})

const fileUpload = ref<HTMLInputElement>()

const emit = defineEmits<{
  (e: 'onDrop', files: FileList): void
}>()
const hasDragOver = ref<boolean>(false)

const drop = (event: any) => {
  hasDragOver.value = false
  const files: FileList = event.dataTransfer.files
  emit('onDrop', files)
}
const dragover = (event: any) => {
  if (!props.multiple && event.dataTransfer.items.length > 1) {
    return
  } else {
    hasDragOver.value = true
  }
}

const selectFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    emit('onDrop', files)
    target.value = ''
  }
}

const triggerUpload = () => {
  if (fileUpload.value) {
    fileUpload.value.click()
  }
}
</script>

<template>
  <div
    class="relative py-8 w-full rounded-md border border-dashed border-gray-500"
    :class="{ 'bg-gray-100': hasDragOver }"
  >
    <div
      class="h-full flex items-center justify-center flex-col"
      @dragover.prevent="dragover"
      @dragleave.prevent="() => (hasDragOver = false)"
      @drop.prevent="drop"
    >
      <slot>
        <div class="text-gray-600">
          <font-awesome-icon icon="cloud-arrow-up" class="mr-2" />
          Drag and Drop files, or
          <a id="browseFiles" class="text-primary-500 cursor-pointer font-bold hover:underline" @click="triggerUpload">browse</a> your
          files
          <input ref="fileUpload" multiple type="file" class="hidden" @change.prevent="selectFiles" />
        </div>
        <div class="text-sm italic mt-2">(Up to 5 Files & File size should be &lt; {{ props.fileSize }}mb)</div>
      </slot>
    </div>
    <div v-if="props.loading" class="absolute inset-0 flex items-center justify-center bg-base-white/80">
      <font-awesome-icon id="fileUploadSpinner" icon="spinner" class="fa-spin mr-2" />
    </div>
  </div>
</template>
