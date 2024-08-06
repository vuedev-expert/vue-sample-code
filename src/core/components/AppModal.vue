<script lang="ts" setup>
import {PropType, ref} from 'vue'
import {ButtonType} from "@/core/models/common.model";

const props = defineProps({
  title: { type: String, default: 'Title' },
  okText: { type: String, default: 'Ok' },
  onOk: { type: Function },
  isNext: { type: Boolean, default: false },
  onNext: { type: Function },
  okIcon: { type: String },
  onCancel: { type: Function },
  cancelText: { type: String, default: 'Cancel' },
  cancelBtnType: { type: String as PropType<ButtonType>, default: 'light' },
  canDismiss: { type: Boolean, default: true },
  width: { type: String, default: '672px' },
  minHeight: { type: String, default: 'auto' },
  hasFooter: { type: Boolean, default: true },
  isHeaderLess: { type: Boolean, default: false },
  isScrollable: { type: Boolean, default: true },
  isHorizontalScrollable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  centerContent: { type: Boolean, default: false },
  showCancelBtn: { type: Boolean, default: true },
  hideCloseIcon: { type: Boolean, default: false },
  modalClass: { type: String, default: '' }
})

const emit = defineEmits(['close'])
const dismiss = () => {
  if (props.canDismiss) {
    emit('close', false)
  }
}
const isLoading = ref(false)

const onSubmit = () => {
  if (isLoading.value) return

  isLoading.value = true
  if (props.onOk)
    props.onOk().then(
      (val: any) => {
        isLoading.value = false
        emit('close', val)
      },
      () => (isLoading.value = false)
    )
}

const cancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  isLoading.value = false
  emit('close', false)
}

const onNextHandler = (e: Event) => {
  console.log('onNextHandler')

  if (props.onNext) {
    props.onNext(e)
  }
}
defineExpose({ onSubmit })
</script>

<template>
  <div
    id="app-modal"
    class="fixed z-[9999] top-0 left-0 w-full h-full bg-base-black/40 flex items-center justify-center"
    :class="[modalClass]"
    @click.self="dismiss"
  >
    <!-- Modal content -->
    <div class="flex flex-col rounded-lg bg-base-white" :class="[
        isHeaderLess ? 'border-2 border-primary-500':'',
         props.isHorizontalScrollable ? 'overflow-x-auto' : 'overflow-x-visible'
        ]" :style="{ width: props.width }">
      <slot>
        <!-- Modal header -->
        <div class="flex items-center justify-between border-b-gray-200" :class="isHeaderLess ? 'border-b-0 px-5  pt-5 pb-0':'border-b px-5 md:px-8 py-5 '">
          <slot name="header">
            <div class="font-semibold text-xl text-gray-700 capitalize">{{ isHeaderLess ? '' : title }}</div>
            <button v-if="!hideCloseIcon" id="closeModal" class="text-gray-500 hover:text-gray-800" @click="cancel">
              <font-awesome-icon icon="xmark"></font-awesome-icon>
            </button>
          </slot>
        </div>
        <!-- Modal body -->
        <div class="flex-1"
             :class="[
               centerContent ? 'flex':'',
               isHeaderLess ? 'px-4 py-4':'px-5 md:px-8 py-4 md:py-6',
               props.isScrollable ? 'overflow-y-auto' : 'overflow-y-visible'
             ]">
          <slot name="body"></slot>
        </div>
        <!-- Modal footer -->
        <div v-if="props.hasFooter" class="flex items-center justify-center px-8 py-5 border-t border-t-gray-200">
          <slot name="footer">
            <AppButton
                v-if="showCancelBtn"
                id="cancelModal"
                :type="cancelBtnType"
                icon="circle-xmark"
                class="mr-2"
                :disabled="props.disabled"
                @click="cancel"
            >{{ props.cancelText }}</AppButton>

            <AppButton
              v-if="!props.isNext && props.onOk"
              id="doAction"
              :loading="isLoading"
              :disabled="props.disabled"
              type="primary"
              :icon="okIcon ?? 'circle-check'"
              @click="onSubmit"
              >{{ props.okText ?? 'Ok' }}</AppButton
            >
            <!-- <AppButton
              v-if="props.onNext && props.isNext"
              type="primary"
              :icon="okIcon ?? 'circle-check'"
              @click="onNextHandler"
              >{{ 'Next' }}</AppButton
            > -->
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
#app-modal > div {
  max-height: calc(100vh - 64px);
  min-height: 400px;
}
</style>
