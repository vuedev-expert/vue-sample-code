<script lang="ts" setup>
import { Action, AddActionPayload, UpdateActionPayload } from '@/core/models/action.model'
import { useActionStore } from '@/store/use-action-store'
import { required } from '@vuelidate/validators'
import { computed, onMounted, PropType, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { useToast } from 'vue-toastification'
import { formatDate } from '@/core/helpers/common'
import DatePicker from '@vuepic/vue-datepicker'
import { useRiskStore } from '@/store/use-risk-store'
import { storeToRefs } from 'pinia'
import AttachmentUpload from './AttachmentUpload.vue'
import { RiskStatus } from '@/core/models/risk.model'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { useAuthStore } from '@/store/use-auth-store'
import AppStepperForm from '@/core/components/AppStepperHeader.vue'

const props = defineProps({
  action: {
    type: Object as PropType<Action>
  }
})

interface FormState {
  assignedUsrId: string | null
  ascId: string | null
  locIds: string[]
  depIds: string[]
  isoId: string | null
  description: string
  rskId: string | null
  legRegId: string | null
  dueDate: Date | null
  remarks: string
}

const { actionSources, isoStandards } = useRiskLookups()

const toast = useToast()
const userStore = useUserSetupStore()
const { assignees, tempUsers } = storeToRefs(userStore)

const riskStore = useRiskStore()
const authStore = useAuthStore()
const emits = defineEmits(['close'])
const actionStore = useActionStore()

const { userDepartments, userLocations } = storeToRefs(authStore)
const { filteredRiskDropdownList } = storeToRefs(riskStore)

const currentTabIndex = ref(0)
const state = ref<FormState>({
  description: props.action?.description ?? '',
  ascId: props.action?.ascId ?? null,
  rskId: props.action?.rskId ?? null,
  legRegId: props.action?.legRegId ?? null,
  isoId: props.action?.isoId ?? null,
  depIds: props.action?.depIds ?? [],
  locIds: props.action?.locIds ?? [],
  assignedUsrId: props.action?.assignedUsrId ?? props.action?.assignedTempUsrId ?? null,
  dueDate: props.action?.dueDate ? new Date(props.action?.dueDate) : null,
  remarks: props.action?.remarks ?? ''
})

const isRiskDisabled = computed(() => {
  if (!state.value.ascId || !actionSources.value.length) return true
  const source = actionSources.value.find((a) => a.ascId === state.value.ascId)
  return source?.name !== 'Risk Module'
})


const tabs = ref([
  {
    id: 0,
    title: 'Step 1',
    validationRules: {
      description: { required },
      ascId: { required },
      rskId: { required: !isRiskDisabled.value && required },
    }
  },
  {
    id: 1,
    title: 'Step 2',
    validationRules: {
      locIds: { required },
      depIds: { required },
      assignedUsrId: { required },
      isoId: { required },
    }
  },
  {
    id: 2,
    title: 'Step 3',
    validationRules: {
      dueDate: { required },
      remarks: {},
    }
  }
])

const initialRule = computed(() => {
  return tabs.value[currentTabIndex.value].validationRules
})

const assigneesWithTempUsers = computed(() => {
  if (props.action) return assignees.value.concat(tempUsers.value)
  else return assignees.value
})

onMounted(() => {
  authStore.getUserProfile()
  riskStore.fetchRisks({ isReport: 'true' }, true)
  if (props.action) actionStore.attachments = props.action.attachments
})

const isLoading = ref(false)
const v$ = ref<any>(useVuelidate(initialRule, state))

const submit = () => {
  isLoading.value = true
  return new Promise((resolve, reject) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      const value = { ...state.value, attachments: [...actionStore.attachments].map((a) => {
          return { attId: a.attId }
        })
      }
      const submitAction = props.action
        ? actionStore.updateAction(props.action.actId, { ...value, rskId: isRiskDisabled.value ? null : value.rskId} as UpdateActionPayload)
        : actionStore.addAction({ ...value, rskId: isRiskDisabled.value ? null : value.rskId,
            status: RiskStatus.OPEN
          } as unknown as AddActionPayload)
      submitAction.then(() => {
        isLoading.value = false
        toast.success(props.action ? 'Action updated successfully' : 'Add new action successfully')
        emits('close', true)
        resolve(true)
      }, () => reject(false))
    } else reject(false)
  })
}
const now = new Date()

const disableDueDate = computed(() => {
  if(props?.action) {
    return ['Legal Register', 'Risk Module'].includes(props.action?.actionSource.name)
  }
  return false
})

const onBack = (e: Event) => {
  e.preventDefault()
  if (currentTabIndex.value !== 0) currentTabIndex.value--
}

const emptyRisk = ref(false)
const onNext = (e: Event) => {
  e.preventDefault()
  if (currentTabIndex.value === 0 && !isRiskDisabled.value && !state.value.rskId) {
    emptyRisk.value = true
    return
  }
  const currentTab = tabs.value.find((t) => t.id === currentTabIndex.value)
  if (!currentTab) return
  v$.value = useVuelidate(currentTab?.validationRules, state)
  v$.value.$validate()
  if (!v$.value.$invalid) currentTabIndex.value++
}
</script>
<template>
  <AppModal
    :title="props.action ? 'Upload evidences in Step 3' : 'Add Action'"
    :ok-text="props.action ? 'Save' : 'Add'"
    :ok-icon="props.action && 'save'"
    :is-scrollable="[2].includes(currentTabIndex)"
    :can-dismiss="false"
    width="768px"
    @close="(value:any) => emits('close', value)"
  >
    <template #body>
      <form class="lah-stepper-form">
        <AppStepperForm :tabs="tabs" :current-tab-index="currentTabIndex" />

        <template v-if="currentTabIndex === 0">
          <div class="form-item mb-3 md:mb-6" :class="{ 'has-error': v$.description.$errors.length }">
            <span class="form-label">Description</span>
            <textarea
              id="descField"
              v-model="state.description"
              :disabled="Boolean(props.action)"
              class="form-input"
              placeholder="Enter the description"
              rows="2"
              @blur="v$.description.$touch"
            />
            <p v-if="v$.description.$errors.length" class="form-error-message">
              {{ v$.description.$errors[0].$message }}
            </p>
          </div>
          <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item mb-0 flex-1" :class="{ 'has-error': v$.ascId.$errors.length }">
            <span class="form-label">Source</span>
            <vue-select
              id="sourceField"
              v-model="state.ascId"
              :options="actionSources"
              :reduce="(rsc: any) => rsc.ascId"
              label="name"
              :disabled="props.action"
              placeholder="Choose the source"
              @search:blur="v$.ascId.$touch"
            />
            <p v-if="v$.ascId.$errors.length" class="form-error-message">
              {{ v$.ascId.$errors[0].$message }}
            </p>
          </div>

          <div class="form-item mb-4 md:mb-6 flex-1" :class="{ 'has-error': emptyRisk }">
            <span class="form-label">Risk</span>
            <vue-select
              id="riskField"
              v-model="state.rskId"
              :options="filteredRiskDropdownList"
              :reduce="(rsc: any) => rsc.rskId"
              label="description"
              :disabled="isRiskDisabled || props.action"
              placeholder="Select Risk"
              @search:blur="emptyRisk = false"
            />
            <p v-if="emptyRisk" class="form-error-message">
              Value is required
            </p>
          </div>
        </div>
        </template>

        <template v-if="currentTabIndex === 1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-item mb-0 flex-1" :class="{ 'has-error': v$.locIds.$errors.length }">
              <span class="form-label">Location</span>
              <vue-select
                id="locField"
                v-model="state.locIds"
                :options="userLocations"
                label="name"
                multiple
                :reduce="(loc: any) => loc.locId"
                :disabled="props.action"
                placeholder="Choose the location"
                @search:blur="v$.locIds.$touch"
              />
              <p v-if="v$.locIds.$errors.length" class="form-error-message">
                {{ v$.locIds.$errors[0].$message }}
              </p>
            </div>

            <div class="form-item mb-4 md:mb-6 flex-1" :class="{ 'has-error': v$.depIds.$errors.length }">
              <span class="form-label">Department</span>
              <vue-select
                id="deptField"
                v-model="state.depIds"
                label="name"
                multiple
                :reduce="(dep: any) => dep.depId"
                :options="userDepartments"
                :disabled="props.action"
                placeholder="Choose the department"
                @search:blur="v$.depIds.$touch"
              />
              <p v-if="v$.depIds.$errors.length" class="form-error-message">
                {{ v$.depIds.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item mb-2 flex-1" :class="{ 'has-error': v$.assignedUsrId.$errors.length }">
            <span class="form-label">Assignee</span>
            <vue-select
              id="assigneeField"
              v-model="state.assignedUsrId"
              :options="assigneesWithTempUsers"
              :reduce="(usr: any) => usr.usrId"
              :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
              placeholder="Select assignee"
              :disabled="props.action"
              @search:blur="v$.assignedUsrId.$touch"
            />
            <p v-if="v$.assignedUsrId.$errors.length" class="form-error-message">
              {{ v$.assignedUsrId.$errors[0].$message }}
            </p>
          </div>
          <div class="form-item mb-4 md:mb-6 flex-1" :class="{ 'has-error': v$.isoId.$errors.length }">
            <span class="form-label">ISO Standard</span>
            <vue-select
              id="isoField"
              v-model="state.isoId"
              :options="isoStandards"
              :reduce="(iso: any) => iso.isoId"
              label="name"
              :disabled="props.action"
              placeholder="Choose the ISO Standard"
              @search:blur="v$.isoId.$touch"
            />
            <p v-if="v$.isoId.$errors.length" class="form-error-message">
              {{ v$.isoId.$errors[0].$message }}
            </p>
          </div>
        </div>
        </template>

        <template v-if="currentTabIndex === 2">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="form-item col-span-1 mr-2" :class="{ 'has-error': v$.dueDate.$errors.length }">
              <span class="form-label">Due Date</span>
              <date-picker
                id="dueDateField"
                v-model="state.dueDate"
                :enable-time-picker="false"
                :format="formatDate"
                :preview-format="'dd/MM/yyyy'"
                :min-date="now"
                :disabled="disableDueDate || props.action"
                placeholder="Select the due date"
              />
              <p v-if="v$.dueDate.$errors.length" class="form-error-message">
                {{ v$.dueDate.$errors[0].$message }}
              </p>
            </div>
          </div>
          <div class="form-item">
            <span class="form-label">Attachments</span>
            <AttachmentUpload></AttachmentUpload>
          </div>
          <div class="form-item">
          <span class="form-label">Remarks</span>
          <textarea
            id="remarksField"
            v-model="state.remarks"
            class="form-input"
            placeholder="Enter the remarks"
            rows="2"
          />
        </div>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <button
                v-show="currentTabIndex > 0"
                id="backTabBtn"
                class="inline-flex items-center px-6 py-2 text-sm text-gray-800 rounded-lg shadow outline-none gap-x-1 hover:bg-gray-100"
                @click="onBack"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                /></svg
              >Back
            </button>
          </div>
          <div class="order-last">
            <button
                id="nextTabBtn"
                class="px-6 py-2 text-sm text-base-white bg-primary-500 rounded-lg outline-none hover:bg-indigo-600 ring-indigo-300 justify-self-end"
                :hidden="currentTabIndex === tabs.length - 1"
                @click="onNext"
            >
              Next
            </button>
            <AppButton
                v-if="currentTabIndex === tabs.length - 1"
                id="formActionBtn"
                :loading="isLoading"
                type="primary"
                :icon="(props.action && 'save') ?? 'circle-check'"
                @click="submit"
            >{{ props.action ? 'Save' : 'Add' }}</AppButton
            >
          </div>
        </div>
      </form>
    </template>
  </AppModal>
</template>
