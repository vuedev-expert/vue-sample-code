<script lang="ts" setup>
import { Attachment } from '@/core/models/action.model'
import { useActionStore } from '@/store/use-action-store'
import { storeToRefs } from 'pinia'
import { onUnmounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import FileDrop from '@/core/components/FileDrop.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const actionStore = useActionStore()
const { attachments, uploading } = storeToRefs(actionStore)
const toast = useToast()

const isConfirmModalShow = ref(false)
let selected = -1
const drop = (files: FileList) => {
  if (attachments.value.length + files.length > 5) {
    toast.error('Can upload up to 5 files!')
    return
  }
  for (const key in files) {
    const file = files[key]
    if (file.size > 1024 * 1024 * 5) {
      toast.error('File size should be < 5mb!')
      return
    }
  }
  actionStore.uploadAttachments(files).then(() => {
    toast.success('Files uploaded successfully!')
  })
}

onUnmounted(() => {
  actionStore.attachments = []
  actionStore.uploading = 'idle'
})

const openDelete = (index: number) => {
  selected = index
  isConfirmModalShow.value = true
}

const deleteFile = () => {
  return new Promise((res) => {
    actionStore.deleteAttachment(selected)
    res(true)
  })
}

const onClose = () => {
  isConfirmModalShow.value = false
  selected = -1
}

const downloadAttachment = (att: Attachment) => {
  actionStore.downloadAttachment(att.attId, att.name)
}
</script>
<template>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" type="danger" :on-ok="deleteFile" @close="onClose">
    <template #body>Do you want to delete this file?</template>
  </ConfirmModal>
  <FileDrop v-if="!props.disabled" :loading="uploading === 'loading'" @on-drop="drop"> </FileDrop>

  <ul v-if="attachments.length" class="space-y-4 mt-4">
    <li v-for="(item, index) in attachments" :id="`uploadedFile-${index}`" :key="index" class="flex">
      <font-awesome-icon icon="fa-regular fa-file" class="mr-2" />
      <span :id="`fileName-${index}`" class="italic font-medium mr-4 cursor-pointer" @click="downloadAttachment(item)">{{ item.name }}</span>
      <span v-if="!props.disabled" :id="`deleteFile-${index}`" class="text-gray-500 hover:text-gray-600 cursor-pointer" @click="openDelete(index)">
        <font-awesome-icon icon="trash" />
      </span>
      <span :id="`downloadFile-${index}`" class="text-gray-500 hover:text-gray-600 cursor-pointer ml-4" @click="downloadAttachment(item)">
        <font-awesome-icon icon="download" />
      </span>
    </li>
  </ul>
  <div
    v-if="props.disabled && !attachments.length"
    class="mb-6 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20"
  >
    No Attachments
  </div>
</template>
