<script lang="ts" setup>
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import {computed, onMounted, watch, ref, PropType} from 'vue'
import { useSubscribedItemsStore } from '@/store/use-subscribe-items-store'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import DatePicker from '@vuepic/vue-datepicker'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { formatDate } from '@/core/helpers/common'
import { useLegalRegisterStore } from '@/store/use-legal-register-store'
import { useUserSetupStore } from '@/store/use-user-setup-store'
import {AppPermission} from "@/core/models/permission.model";
import { useRiskStore } from '@/store/use-risk-store'
import {useActionStore} from "@/store/use-action-store";
import {Action, AddActionPayload} from "@/core/models/action.model";
import {RiskStatus} from "@/core/models/risk.model";
import {useToast} from "vue-toastification";

interface FormState {
  assignedUsrId: string | null
  ascId: string | null
  locIds: string[]
  depIds: string[]
  isoId: string | null
  description: string
  rskId: string | null
  dueDate: Date
  remarks: string
}

const props = defineProps({
  action: {
    type: Object as PropType<Action>
  }
})
const emits = defineEmits(['close'])
const subItemStore = useSubscribedItemsStore()
const authStore = useAuthStore()
const userStore = useUserSetupStore()
const riskStore = useRiskStore()
const actionStore = useActionStore()
const { assignees } = storeToRefs(userStore)
const legalStore = useLegalRegisterStore()
const { legisItemsDropdown } = storeToRefs(subItemStore)
const { userLocations, userDepartments } = storeToRefs(authStore)
const { actionSources, isoStandards } = useRiskLookups()
const toast = useToast()
const { filteredRiskDropdownList } = storeToRefs(riskStore)

const state =  ref<FormState>({
  description: props.action?.description ?? '',
  ascId: props.action?.ascId ?? null,
  rskId: props.action?.rskId ?? null,
  isoId: props.action?.isoId ?? null,
  depIds: props.action?.depIds ?? [],
  locIds: props.action?.locIds ?? [],
  assignedUsrId: props.action?.assignedUsrId ?? null,
  dueDate: new Date(props.action?.dueDate ?? new Date()),
  remarks: props.action?.remarks ?? ''
})

const rules = computed(() => ({
  description: { required },
  isoId: { required: !state.value.rskId && required },
  remarks: {},
  ascId: { required },
  rskId: { required: !isRiskDisabled.value && required },
  depIds: { required },
  locIds: { required },
  assignedUsrId: { required },
  dueDate: { required },
}))

const isRiskDisabled = computed(() => {
  if (!state.value.ascId || !actionSources.value.length) return true
  const source = actionSources.value.find((a) => a.ascId === state.value.ascId)
  return source?.name !== 'Risk Module'
})

watch(
    () => [state.value.depIds, state.value.locIds],
    () => {
      fetchUser()
    }
)

const updateRisk = () => {
  const risk = filteredRiskDropdownList.value.find((r) => r.rskId === state.value.rskId)
  if (risk) {
    state.value.depIds = risk.depIds
    state.value.locIds = risk.locIds
    state.value.dueDate = new Date(risk.dueDate)
    state.value.isoId = risk.isoId
  }
}

const fetchUser = () => {
  if (!state.value.locIds || !state.value.depIds) {
    userStore.userDropdownList = []
    state.value.assignedUsrId = null
  } else {
    userStore.getUserList(
        { locId: state.value.locIds, depId: state.value.depIds, permissions: AppPermission.ACTION_ASSIGNEE },
        true
    )
  }
}

onMounted(() => {
  fetchUser()
  authStore.getUserProfile()
  riskStore.fetchRisks({ take: 100 }, true)
  if (props.action) {
    actionStore.attachments = props.action.attachments
  }
})

const now = new Date()


// onMounted(() => {
//   subItemStore.getSubItems({}, true)
// })
// onUnmounted(() => {
//   subItemStore.legisItemsDropdown = []
// })

const currentTabIndex = ref(0)
const tabs = ref([
  {
    id: 0,
    title: 'Step 1',
    validationRules: {
      description: { required },
    }
  },
  {
    id: 1,
    title: 'Step 2',
    validationRules: {
      ascId: { required },
      locIds: { required },
      depIds: { required }
    }
  },
  {
    id: 2,
    title: 'Step 3',
    validationRules: {
      assignedUsrId: { required },
      isoId: { required },
    }
  },
  {
    id: 3,
    title: 'Step 4',
    validationRules: {
      dueDate: { required },
    }
  },
])

const initialRule = computed(() => {
  return tabs.value[currentTabIndex.value].validationRules
})

const v$ = ref<any>(useVuelidate(initialRule, state))
const isLoading = ref(false)

const submit = () => {
  if (isLoading.value) return

  isLoading.value = true
  new Promise((res, rej) => {
    v$.value.$validate()
    // console.log(v$)
    if (!v$.value.$invalid) {
      const value = {
        ...state.value,
        attachments: [...actionStore.attachments].map((a) => {
          return { attId: a.attId }
        })
      }
      actionStore
          .addAction({
            ...value,
            rskId: isRiskDisabled.value ? null : value.rskId,
            status: RiskStatus.OPEN
          } as unknown as AddActionPayload)
          .then(() => toast.success('Add new action successfully'))
          .catch((e) => console.log(e))
    } else {
      isLoading.value = false
      rej(false)
    }
  })
}
// watch(
//   () => v$,
//   () => {
//     console.log(v$.value, 'v$')
//   }
// )
const onNext = (e: Event) => {
  e.preventDefault()
  const currentTab = tabs.value.find((t) => t.id === currentTabIndex.value)
  if (!currentTab) return
  v$.value = useVuelidate(currentTab?.validationRules, state)
  v$.value.$validate()

  console.log('test ', currentTab?.validationRules, v$.value.$invalid)
  if (!v$.value.$invalid) {
    currentTabIndex.value++
  }
}

const onBack = (e: Event) => {
  e.preventDefault()
  // console.log()

  // console.log(currentTabIndex.value == 0)

  if (currentTabIndex.value !== 0) {
    currentTabIndex.value--
  }
}

const getTabClasses = (id: number) => {
  let tabClass = ''
  if (id === currentTabIndex.value) return 'active'
  if (id < currentTabIndex.value) return 'previous'
  return tabClass
}

const getMultiSelectTitle = (itemsList: any, title: string) => {
  if (itemsList.length === 1) return `Selected ${title}`
  return itemsList.length > 1 ? `Selected ${title}s` : `Select ${title}`
}
</script>
<template>
  <AppModal
      title="Add Action"
      ok-text="Add"
      ok-icon="save"
      :can-dismiss="false"
      :on-ok="submit"
      :on-next="onNext"
      :is-next="true"
      @close="(value:any) => emits('close', value)"
  >
    <!-- :is-next="currentTabIndex !== tabs.length - 1" -->
    <template #body>
      <form class="lah-stepper-form">
        <div class="lah-stepper-header text-gray-600 py-4 mx-auto">
          <div class="flex justify-center">
            <div v-for="tab in tabs" :key="tab.id" class="lah-step flex-1" :class="getTabClasses(tab.id)">
              <div class="relative mb-1">
                <div class="w-10 h-10 mx-auto rounded-full text-lg flex items-center justify-center index">
                  <svg v-if="tab.id < currentTabIndex" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="25" height="25" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFFFFF" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <path d="M5 12l5 5l10 -10" />
                  </svg>
                  <span v-else class="text-center text-white w-full">{{ tab.id + 1 }}</span>
                </div>
                <div class="divider"></div>
              </div>
              <div class="text-center title">{{ tab.title }}</div>
            </div>
          </div>
        </div>

        <template v-if="currentTabIndex === 0">
          <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
            <span class="form-label">Description</span>
            <textarea
                v-model="state.description"
                class="form-input"
                placeholder="Enter the description"
                rows="2"
                @blur="v$.description.$touch"
            />
            <p v-if="v$.description.$errors.length" class="form-error-message">
              {{ v$.description.$errors[0].$message }}
            </p>
          </div>
        </template>

        <template v-if="currentTabIndex === 1">
          <div class="flex space-x-4">
            <div class="form-item flex-1" :class="{ 'has-error': v$.ascId.$errors.length }">
              <span class="form-label">Source</span>
              <vue-select
                  v-model="state.ascId"
                  :options="actionSources"
                  :reduce="(rsc: any) => rsc.ascId"
                  label="name"
                  placeholder="Choose the source"
                  @search:blur="v$.ascId.$touch"
              />
              <p v-if="v$.ascId.$errors.length" class="form-error-message">
                {{ v$.ascId.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1">
              <span class="form-label">Risk</span>
              <vue-select
                  v-model="state.rskId"
                  :options="filteredRiskDropdownList"
                  :reduce="(rsc: any) => rsc.rskId"
                  label="description"
                  :disabled="isRiskDisabled"
                  placeholder="Select Risk"
              />
            </div>
          </div>
          <div class="flex space-x-4">
            <div class="form-item flex-1" :class="{ 'has-error': v$.locIds.$errors.length }">
                <span class="form-label">Location</span>
                <vue-select
                    v-model="state.locIds[0]"
                    :options="userLocations"
                    label="name"
                    :reduce="(loc: any) => loc.locId"
                    placeholder="Choose the location"
                    @search:blur="v$.locIds.$touch"
                />
                <p v-if="v$.locIds.$errors.length" class="form-error-message">
                  {{ v$.locIds.$errors[0].$message }}
                </p>
              </div>
            <div class="form-item flex-1" :class="{ 'has-error': v$.depIds.$errors.length }">
              <span class="form-label">Department</span>
              <vue-select
                  v-model="state.depIds[0]"
                  label="name"
                  :reduce="(dep: any) => dep.depId"
                  :options="userDepartments"
                  placeholder="Choose the department"
                  @search:blur="v$.depIds.$touch"
              />
              <p v-if="v$.depIds.$errors.length" class="form-error-message">
                {{ v$.depIds.$errors[0].$message }}
              </p>
            </div>
          </div>
        </template>

        <template v-if="currentTabIndex === 2">
          <div class="flex space-x-4">
            <div class="form-item flex-1" :class="{ 'has-error': v$.assignedUsrId.$errors.length }">
              <span class="form-label">Assignee</span>
              <vue-select
                  v-model="state.assignedUsrId"
                  :options="assignees"
                  :reduce="(usr: any) => usr.usrId"
                  :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
                  placeholder="Select assignee"
                  @search:blur="v$.assignedUsrId.$touch"
              />
              <p v-if="v$.assignedUsrId.$errors.length" class="form-error-message">
                {{ v$.assignedUsrId.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1" :class="{ 'has-error': v$.isoId.$errors.length }">
              <span class="form-label">ISO Standard</span>
              <vue-select
                  v-model="state.isoId"
                  :options="isoStandards"
                  :reduce="(iso: any) => iso.isoId"
                  label="name"
                  placeholder="Choose the ISO Standard"
                  @search:blur="v$.isoId.$touch"
              />
              <p v-if="v$.isoId.$errors.length" class="form-error-message">
                {{ v$.isoId.$errors[0].$message }}
              </p>
            </div>
          </div>
        </template>

        <template v-if="currentTabIndex === 3">
          <div class="form-item">
            <span class="form-label">Attachments</span>
            <AttachmentUpload></AttachmentUpload>
          </div>
          <div class="form-item">
            <span class="form-label">Remarks</span>
            <textarea
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
                class="px-6 py-2 text-sm text-base-white bg-primary-500 rounded-lg outline-none hover:bg-indigo-600 ring-indigo-300 justify-self-end"
                :hidden="currentTabIndex === tabs.length - 1"
                @click="onNext"
            >
              Next
            </button>
            <AppButton
                v-if="currentTabIndex === tabs.length - 1"
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

<style scoped></style>
