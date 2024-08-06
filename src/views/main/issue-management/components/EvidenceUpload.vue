<script lang="ts" setup>
import { Attachment } from '@/core/models/action.model'
import { useIssueStore } from "@/store/use-issue-store"
import { storeToRefs } from 'pinia'
import { onUnmounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import FileDrop from '@/core/components/FileDrop.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const issueStore = useIssueStore()
const { attachments, uploading } = storeToRefs(issueStore)
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
    if (file.size > 1024 * 1024 * 200) {
      toast.error('File size should be < 200mb!')
      return
    }
  }
  issueStore.uploadAttachments(files).then(() => {
    toast.success('Evidence uploaded successfully!')
  })
}

onUnmounted(() => {
  issueStore.uploading = 'idle'
})

const openDelete = (index: number) => {
  selected = index
  isConfirmModalShow.value = true
}

const deleteFile = () => {
  return new Promise((res) => {
    issueStore.deleteAttachment(selected)
    res(true)
  })
}

const onClose = () => {
  isConfirmModalShow.value = false
  selected = -1
}

const downloadAttachment = (att: Attachment) => {
  issueStore.downloadAttachment(att.attId, att.name)
}
</script>
<template>
  <ConfirmModal v-if="isConfirmModalShow" title="Confirmation" type="danger" :on-ok="deleteFile" @close="onClose">
    <template #body>Do you want to delete this file?</template>
  </ConfirmModal>
  <FileDrop v-if="!props.disabled" :file-size="200" :loading="uploading === 'loading'" @on-drop="drop"> </FileDrop>

  <ul v-if="attachments.length" class="space-y-4 mt-4">
    <li v-for="(item, index) in attachments" :key="index" class="flex">
      <font-awesome-icon icon="fa-regular fa-file" class="mr-2" />
      <span class="italic font-medium mr-4 cursor-pointer">{{ item.name }}</span>
      <span v-if="!props.disabled" class="text-gray-500 hover:text-gray-600 cursor-pointer" @click="openDelete(index)">
        <font-awesome-icon icon="trash" />
      </span>
      <span class="text-gray-500 hover:text-gray-600 cursor-pointer ml-4" @click="downloadAttachment(item)">
        <font-awesome-icon icon="download" />
      </span>
    </li>
  </ul>
  <div
    v-if="props.disabled && !attachments.length"
    class="mb-6 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20"
  >No Attachments</div>
</template>
