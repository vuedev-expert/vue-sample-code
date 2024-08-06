<script lang="ts" setup>
import { Action, ActionActType, ActionStatus } from '@/core/models/action.model'
import { useActionStore } from '@/store/use-action-store'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps<{ action: Action; type: ActionActType }>()
const emits = defineEmits(['close'])
const toast = useToast()
const actionStore = useActionStore()

const state = ref({
  approvalComment: ''
})

const modalType = computed(() => {
  if (props.type === 'Reject') return 'danger'
  return 'default'
})
const okIcon = computed(() => {
  if (props.type === 'Reject') return 'times'
  else if (props.type === 'Approve') return 'check'
  return 'paper-plane'
})
const message = computed(() => {
  if (props.type === 'Send') return 'send for approval'
  return props.type.toLowerCase()
})

const rules = computed(() => ({ approvalComment: { required } }))

const v$ = useVuelidate(rules, state)

const getStatus = () => {
  switch (props.type) {
    case 'Send':
      return ActionStatus.IN_REVIEW
    case 'Approve':
      return ActionStatus.APPROVED
    case 'Reject':
      return ActionStatus.REJECTED
  }
}

const onUpdateStatus = () =>
  new Promise((resolve, reject) => {
    v$.value.$validate()
    if (v$.value.$invalid) reject(false)
    else {
      actionStore
        .updateActionStatus(props.action.actId, {
          status: getStatus(),
          approvalComment: state.value.approvalComment
        })
        .then(
          () => {
            toast.success('Action status has been updated!')
            resolve(true)
          },
          (err) => {
            console.log(err)
            reject(false)
          }
        )
    }
  })
</script>
<template>
  <ConfirmModal
    title="Confirmation?"
    :on-ok="onUpdateStatus"
    width="460px"
    :ok-text="props.type"
    :ok-icon="okIcon"
    :type="modalType"
    :can-dismiss="false"
    @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <div class="mb-4 font-bold">Do you want to {{ message }} this action?</div>
      <div class="form-item" :class="{ 'has-error': v$.approvalComment.$errors.length }">
        <textarea
          id="commentField"
          v-model="state.approvalComment"
          placeholder="Input your comment"
          rows="2"
          class="form-input"
          @blur="v$.approvalComment.$touch"
        />
        <p v-if="v$.approvalComment.$errors.length" class="form-error-message">
          {{ v$.approvalComment.$errors[0].$message }}
        </p>
      </div>
    </template></ConfirmModal>
</template>
