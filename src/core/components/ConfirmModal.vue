<script lang="ts" setup>
import { ref } from 'vue'
import type { PropType } from 'vue'

type ModalTypes = 'danger' | 'default' | 'warning'

const props = defineProps({
  title: { type: String, default: 'Title' },
  bodyMessage: { type: String, default: 'Body' },
  okText: { type: String },
  onOk: { type: Function },
  showDelBtn: { type: Boolean, default: true },
  okIcon: { type: String },
  onCancel: { type: Function },
  cancelText: { type: String, default: 'Cancel' },
  canDismiss: { type: Boolean, default: true },
  width: { type: String, default: '480px' },
  type: {
    type: String as PropType<ModalTypes>,
    default: 'default'
  },
  hasFooter: { type: Boolean, default: true },
  isHeaderLess: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const dismiss = () => {
  if (props.canDismiss) {
    emit('close', false)
  }
}
const isLoading = ref(false)

const onSubmit = () => {
  isLoading.value = true
  if (props.onOk)
    props
      .onOk()
      .then((res: any) => {
        isLoading.value = false
        emit('close', res)
      })
      .catch((e: any) => {
        console.log(e)
        isLoading.value = false
      })
}
const cancel = () => {
  if (props.onCancel) props.onCancel()
  emit('close', false)
}
</script>

<template>
  <div
    id="defaultModal"
    class="fixed z-[9999] top-0 left-0 w-full h-full bg-base-black/40 flex items-center justify-center"
    @click.self="dismiss"
  >
    <div
      class="flex flex-col w-full right-0 top-0 rounded-lg bottom-0 overflow-y-hidden bg-base-white"
      :style="{ width: props.width }"
    >
      <!-- Modal content -->
      <div v-if="!isHeaderLess" class="flex items-center justify-between px-8 py-5 border-b border-b-gray-200">
        <!-- Modal header -->
        <slot name="header">
          <div
            class="text-xl"
            :class="{
              'text-red-500': props.type === 'danger',
              'text-primary-500': props.type === 'default',
              'text-gray-700': props.type === 'warning'
            }"
          >
            <font-awesome-icon v-if="props.type === 'default'" icon="circle-info" class="mr-2"></font-awesome-icon>
            <font-awesome-icon
              v-if="props.type === 'warning'"
              icon="circle-info"
              class="mr-2 text-yellow-500"
            ></font-awesome-icon>
            <font-awesome-icon
              v-if="props.type === 'danger'"
              icon="triangle-exclamation"
              class="mr-2"
            ></font-awesome-icon>
            {{ title }}
          </div>
          <button class="text-gray-500 hover:text-gray-800" @click="cancel">
            <font-awesome-icon icon="xmark"></font-awesome-icon>
          </button>
        </slot>
      </div>
      <!-- Modal body -->
      <div class="flex-1 px-8 py-5 min-h-[100px]">
        <slot name="body"></slot>
      </div>
      <!-- Modal footer -->
      <div v-if="props.hasFooter" class="flex items-center justify-center px-8 py-5 border-t border-t-gray-200">
        <slot name="footer">
          <AppButton id="confirmCloseBtn" type="light" icon="circle-xmark" class="mr-2" @click="cancel">{{ props.cancelText }}</AppButton>

          <AppButton
            v-if="props.type === 'danger' && showDelBtn"
            id="confirmDelBtn"
            :loading="isLoading"
            type="danger"
            :icon="okIcon ?? 'trash'"
            @click="onSubmit"
            >{{ props.okText ?? 'Delete' }}</AppButton
          >
          <AppButton
            v-if="props.type === 'default' || props.type === 'warning'"
            id="confirmOKBtn"
            :loading="isLoading"
            type="primary"
            :icon="okIcon ?? 'circle-check'"
            @click="onSubmit"
            >{{ props.okText ?? 'Ok' }}</AppButton
          >
        </slot>
      </div>
    </div>
  </div>
</template>
