<script lang="ts" setup>
import useVuelidate from '@vuelidate/core'
import {numeric, required} from '@vuelidate/validators'
import {computed, onMounted, onUnmounted, PropType, ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {useLookupStore} from "@/store/use-lookup-store";
import DatePicker from '@vuepic/vue-datepicker'
import {formatDate, isDeepEqual} from '@/core/helpers/common'
import {useIssueStore} from "@/store/use-issue-store";
import {FilterDropDownItem} from '@/core/models/common.model'
import {useUserSetupStore} from '@/store/use-user-setup-store'
import {
  AddIssueDraftPayload,
  FormState,
  Issue,
  IssueStatus,
  issueTypes,
  priorityType,
  RootCauseAnalysis
} from "@/core/models/issue-model";
import EvidenceUpload from '@/views/main/issue-management/components/EvidenceUpload.vue'
import {analysisOptions} from "@/core/constants/issues-constants";
import RiskMitigationForm from "@/views/main/risks/RiskMitigationForm.vue"
import FormStepFour from "@/views/main/issue-management/components/FormStepFour.vue"
import FormStepFive from "@/views/main/issue-management/components/FormStepFive.vue"
import FormStepSix from "@/views/main/issue-management/components/FormStepSix.vue"
import AppButton from "@/core/components/AppButton.vue";
import {RiskMitigationPayload} from "@/core/models/risk.model";
import RiskanalysisFields from "@/views/main/issue-management/components/RiskAnalysisFields.vue";
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import AppStepperForm from '@/core/components/AppStepperHeader.vue'

const props = defineProps({
  item: { type: Object as PropType<Issue> },
  isUpdatingIssue: { type: Boolean }
})
const propItem = JSON.parse(JSON.stringify(props.item ?? ''))

const emits = defineEmits(['close', 'showUserModal'])
const userStore = useUserSetupStore()
const issueStore = useIssueStore()
const lookupStore = useLookupStore()
const { issueID, attachments } = storeToRefs(issueStore)
const { owners, assignees, tempUsers } = storeToRefs(userStore)
const { isoStandards } = storeToRefs(lookupStore)

const defaultAnalysisVal :RootCauseAnalysis[] = [
  { question: '', answer: '' },
  { question: '', answer: '' },
  { question: '', answer: '' },
]

const state = ref<FormState>({
  issueId: propItem?.issueId ?? null,
  draftStep: propItem?.draftStep ?? 0,
  locId: propItem?.locId ?? null,
  depIds: propItem?.depIds ?? [],
  isoId: propItem?.isoId ?? null,
  ownId: propItem?.ownId ?? null,
  description: propItem?.description ?? '',
  dueDate: propItem?.dueDate ?? new Date(),
  dateOfOccurrence: propItem?.dateOfOccurrence ?? new Date(),
  othersText: propItem?.othersText ?? '',
  remarks: propItem?.remarks ?? '',
  numPersonsAtRisk: propItem?.numPersonsAtRisk ?? '',
  issueType: propItem?.issueType ?? null,
  priorityType: propItem?.priorityType ?? null,
  mitigations: propItem?.mitigations ?? [],
  whys: propItem?.whys ?? defaultAnalysisVal,
  riskIds: propItem?.riskIds ?? [],
  legRegIds: propItem?.legRegIds ?? [],
  orgLegIds: propItem?.orgLegIds ?? [],
  attachments: propItem?.attachments ?? [],
  status: !propItem?.status ? 'INCOMPLETE' : propItem.status === IssueStatus.ACCEPTED ? IssueStatus.OPEN : propItem.status
})
const initialState :AddIssueDraftPayload = JSON.parse(JSON.stringify(state.value))

onMounted(() => {
  if (propItem) issueStore.attachments = propItem?.attachments || []
})
onUnmounted(() => {
  issueID.value = null
  issueStore.attachments = []
})

watch(() => attachments.value, (val) => state.value.attachments = val)

const now = new Date()

const currentTabIndex = ref(propItem && !props.isUpdatingIssue ? propItem?.draftStep - 1 : 0)

const hiddenOtherField = ref<Boolean>(state.value.issueType === 'Others')

const tabs = ref([
  {
    id: 0,
    title: 'Step 1',
    validationRules: {
      description: { required },
      isoId: { required },
      ownId:{ required },
      depIds: { required },
      locId: { required },
      dueDate: { required },
      issueType: { required },
      dateOfOccurrence: { required },
      numPersonsAtRisk: { numeric },
      priorityType: { required }
    }
  },
  {
    id: 1,
    title: 'Step 2',
    validationRules: {}
  },
  {
    id: 2,
    title: 'Step 3',
    validationRules: {}
  },
  {
    id: 3,
    title: 'Step 4',
    validationRules: {}
  },
  {
    id: 4,
    title: 'Step 5',
    validationRules: {}
  },
  {
    id: 5,
    title: 'Step 6',
    validationRules: {}
  },
])

const initialRule = computed(() => {
  return tabs.value[currentTabIndex.value].validationRules
})
const v$ = ref<any>(useVuelidate(initialRule, state))
const isLoading = ref(false)
const draftLoading = ref(false)
const isDraftConfirmationShow = ref(false)

const actionCheck = () => {
  if (!state.value.mitigations.length) return IssueStatus.OPEN
  const allApproved = state.value.mitigations.every(miti => miti.action?.status === 'APPROVED')
  if (allApproved) return IssueStatus.AWAITING_REVIEW
  const actionItems = state.value.mitigations.map(action => action.isActionItem)
  return actionItems.includes(true) ? IssueStatus.IN_PROGRESS : IssueStatus.OPEN
}

const submit = () => {
  if (isLoading.value) return

  isLoading.value = true
  return new Promise((res, rej) => {
    v$.value.$validate()
    if (!v$.value.$invalid) {
      state.value.status = actionCheck()
      let currentTab = currentTabIndex.value
      state.value.draftStep = ++currentTab
      const value = {
        ...state.value,
        attachments: [...issueStore.attachments].map((a) => {
          return { attId: a.attId }
        })
      }
      if (!props.isUpdatingIssue) {
        issueStore.addIssueDraft(value as AddIssueDraftPayload).then(
            () => {
              isLoading.value = false
              emits('close', true)
              res(true)
            },
            () => {
              isLoading.value = false
              rej(false)
            })
      } else {
        issueStore.updateIssue(value as AddIssueDraftPayload).then(
            () => {
              isLoading.value = false
              emits('close', true)
              res(true)
            },
            () => {
              isLoading.value = false
              rej(false)
            })
      }
    } else {
      isLoading.value = false
      rej(false)
    }
  })
}

const childComponentRefs = ref<any[]>([]);
const onNext = async () => {
  const currentTab = tabs.value.find((t) => t.id === currentTabIndex.value)
  if (!currentTab) return
  else {
    v$.value = useVuelidate(currentTab?.validationRules, state)
    await v$.value.$validate()
    if (!v$.value.$invalid) {
      if (hiddenOtherField.value && (!state.value.othersText.length || state.value.othersText.length > 70)) return
      currentTabIndex.value++
    }
  }
}

const onBack = (e: Event) => {
  e.preventDefault()
  if (currentTabIndex.value !== 0) currentTabIndex.value--
}

const getTabClasses = (id: number) => {
  let tabClass =
      'inline-flex items-center justify-center w-1/2 py-3 font-medium leading-none tracking-wider text-indigo-500 bg-gray-100 border-b-2 border-indigo-500 rounded-t sm:px-4 sm:w-auto sm:justify-start title-font'
  if (id === currentTabIndex.value) tabClass += ' bg-primary-500 text-base-white'
  return tabClass
}

const issueItems = computed<FilterDropDownItem[]>(() => issueTypes.map(type => ({ id: type.value, name: type.text })))

const selectedAnalysisCount = ref<number>(propItem?.whys?.length ? propItem.whys.length :3)
const showMitigationModal = ref<Boolean>(false)

const mitigationIndex = ref<number>(-1)
const isConfirmModalShow =ref<Boolean>(false)
const onShowDeleteConfirmation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  isConfirmModalShow.value = true
}
const onUpdateMitigation = (_mitigationIndex: number) => {
  mitigationIndex.value = _mitigationIndex
  showMitigationModal.value = true
}
const onDeletedMitigation = () =>
    new Promise((resolve) => {
      state.value.mitigations.splice(mitigationIndex.value, 1)
      resolve(true)
    })

const isDraftSaved = ref<Boolean>(false)
const saveIssueDraft = async (showToast :Boolean = true) => {
  let currentTab = currentTabIndex.value
  state.value.draftStep = ++currentTab
  if (showToast) {
    draftLoading.value = true
    isDraftSaved.value = true
  }
  const value = { ...state.value,
    attachments: [...issueStore.attachments].map((a) => {
      return { attId: a.attId }
    })
  }
  await issueStore.addIssueDraft(value as AddIssueDraftPayload, showToast)
  draftLoading.value = false
}
defineExpose({ saveIssueDraft })

const onSubmitMitigationModal = (result: RiskMitigationPayload) => {
  if (mitigationIndex.value === -1) state.value.mitigations.push(result)
  else state.value.mitigations[mitigationIndex.value] = result
}

watch(selectedAnalysisCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    for (let i = 0; i < newCount - oldCount; i++) state.value.whys.push({question: '', answer: ''})
  } else {
    for (let i = 0; i < oldCount - newCount; i++) state.value.whys.pop()
  }
})

const hasChanged = computed(() => {
  return !isDeepEqual(JSON.parse(JSON.stringify(state.value)), initialState, ['depIds', 'riskIds', 'legRegIds', 'orgLegIds'])
})
const closingModal = (value? :any) => {
  if (!props.isUpdatingIssue
      && hasChanged.value &&
      !isDraftSaved.value &&
      state.value.status !== 'IN_PROGRESS'
  ) isDraftConfirmationShow.value = true
  else emits('close', value)
}
const confirmationDraftLoader = ref<Boolean>(false)
const savingDraft = async () => {
  let currentTab = currentTabIndex.value
  state.value.draftStep = ++currentTab
  confirmationDraftLoader.value = true
  const value = { ...state.value,
    attachments: [...issueStore.attachments].map((a) => {
      return { attId: a.attId }
    })
  }
  await issueStore.addIssueDraft(value as AddIssueDraftPayload)
      .then(() => emits('close', true))
  confirmationDraftLoader.value = false
}

const issueTypeSelected= (val :any) => {
  if (val.name === 'Others') hiddenOtherField.value = true
  else {
    state.value.othersText = ''
    hiddenOtherField.value = false
  }
}

const filteredDepartments = computed(() => {
  console.log('dept ', state.value.ownId)
  if (state.value?.ownId) return owners.value.filter((user) => user?.usrId === state.value.ownId)[0]?.departments || []
  else return []
})

const filteredLocations = computed(() => {
  if (state.value?.ownId) return owners.value.filter((user) => user?.usrId === state.value.ownId)[0]?.locations || ''
  else return ''
})

watch(
    () => [state.value.ownId], () => {
      state.value.locId = null
      state.value.depIds = []
    }
)

const assigneesWithTempUsers = computed(() => assignees.value.concat(tempUsers.value))
</script>
<template>
  <AppModal
      :title="props.item && props.isUpdatingIssue ? 'Edit Issue' : `Add New Issue`"
      :ok-text="props.item && props.isUpdatingIssue ? 'Save' : 'Add'"
      :ok-icon="props.item && 'save'"
      :width="[3, 4, 5].includes(currentTabIndex) ? '90%' :'700px'"
      :is-horizontal-scrollable="[1].includes(currentTabIndex)"
      :can-dismiss="false"
      @close="closingModal"
  >
    <template #body>
      <form class="lah-stepper-form">
        <AppStepperForm
            :tabs="tabs"
            :current-tab-index="currentTabIndex"
            :wide-form="[3, 4, 5].includes(currentTabIndex)"
        />

        <template v-if="currentTabIndex === 0">
          <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">GENERAL INFORMATION</div>
          <div class="form-item" :class="{ 'has-error': v$.description.$errors.length }">
            <span class="form-label">Description</span>
            <textarea
                id="descField"
                v-model="state.description"
                class="form-input"
                placeholder="Enter the description"
                rows="4"
                @search:blur="v$.description.$touch"
            />
            <p v-if="v$.description.$errors.length" class="form-error-message">
              {{ v$.description.$errors[0].$message }}
            </p>
          </div>

          <div class="flex flex-col md:flex-row">
            <div class="form-item flex-1 md:mr-4" :class="{ 'has-error': v$.isoId.$errors.length }">
              <span class="form-label">ISO Standard</span>
              <vue-select
                  id="isoField"
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
            <div class="form-item flex-1" :class="{ 'has-error': v$.ownId.$errors.length }">
              <span class="form-label">Owner</span>
              <vue-select
                  id="ownerField"
                  v-model="state.ownId"
                  :options="owners"
                  :reduce="(usr: any) => usr.usrId"
                  :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
                  placeholder="Choose the risk's owner"
                  @search:blur="v$.ownId.$touch"
              />
              <p v-if="v$.ownId.$errors.length" class="form-error-message">
                {{ v$.ownId.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="uppercase font-semi-bold text-gray-400 text-lg mb-4">RELATED INFORMATION</div>

          <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <div class="form-item flex-1 mb-2 md:mb-6" :class="{ 'has-error': v$.locId.$errors.length }">
              <span class="form-label">Location</span>
              <vue-select
                  id="locField"
                  v-model="state.locId"
                  :options="filteredLocations"
                  label="name"
                  :reduce="(usr: any) => usr.locId"
                  placeholder="Select Location"
                  @search:blur="v$.locId.$touch"
              />
              <p v-if="v$.locId.$errors.length" class="form-error-message">
                {{ v$.locId.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1 mb-6" :class="{ 'has-error': v$.depIds.$errors.length }">
              <span class="form-label">Departments</span>
              <vue-select
                  id="depField"
                  v-model="state.depIds"
                  :options="filteredDepartments"
                  label="name"
                  :reduce="(usr: any) => usr.depId"
                  multiple
                  placeholder="Select Departments"
                  @search:blur="v$.depIds.$touch"
              />
              <p v-if="v$.depIds.$errors.length" class="form-error-message">
                {{ v$.depIds.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-item flex-1" :class="{ 'has-error': v$.issueType.$errors.length }">
              <span class="form-label">Issue Type</span>
              <vue-select
                  id="issueTypeField"
                  v-model="state.issueType"
                  :options="issueItems"
                  label="name"
                  :reduce="(type: any) => type.name"
                  placeholder="Choose the issue type"
                  @search:blur="v$.issueType.$touch"
                  @option:selected="issueTypeSelected"
              />
              <p v-if="v$.issueType.$errors.length" class="form-error-message">
                {{ v$.issueType.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1" :class="{ 'has-error': v$.dateOfOccurrence.$errors.length }">
              <span class="form-label">Date of Occurrence</span>
              <date-picker
                  id="occurDateField"
                  v-model="state.dateOfOccurrence"
                  :enable-time-picker="false"
                  :format="formatDate"
                  :preview-format="'dd/MM/yyyy'"
                  :max-date="now"
                  placeholder="Select the date"
              />
              <p v-if="v$.dateOfOccurrence.$errors.length" class="form-error-message">
                {{ v$.dateOfOccurrence.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-2 md:gap-4">
            <div v-if="hiddenOtherField" class="form-item mb-0 flex-1" :class="{ 'has-error': !state.othersText.length || state.othersText.length > 70 }">
              <span class="form-label">Others</span>
              <input
                  id="otherTypeField"
                  v-model="state.othersText"
                  type="text"
                  class="form-input"
                  placeholder="Enter other option"
              />
              <p v-if="!state.othersText.length" class="form-error-message">Value is required</p>
              <p v-if="state.othersText.length > 70" class="form-error-message">The maximum length allowed is 70</p>
            </div>
            <div v-else class="flex-1" />
            <div class="form-item flex-1" :class="{ 'has-error': v$.numPersonsAtRisk.$errors.length }">
              <span class="form-label">How many people were at risk</span>
              <input
                  id="peopleAtRiskField"
                  v-model="state.numPersonsAtRisk"
                  type="text"
                  class="form-input"
                  placeholder="Enter the number of people"
                  @blur="v$.numPersonsAtRisk.$touch"
              />
              <p v-if="v$.numPersonsAtRisk.$errors.length" class="form-error-message">
                {{ v$.numPersonsAtRisk.$errors[0].$message }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-item flex-1" :class="{ 'has-error': v$.priorityType.$errors.length }">
              <span class="form-label">Priority Type</span>
              <vue-select
                  id="priorityTypeField"
                  v-model="state.priorityType"
                  :options="priorityType"
                  label="text"
                  :reduce="(type: any) => type.value"
                  placeholder="Choose the priority type"
                  @search:blur="v$.priorityType.$touch"
              />
              <p v-if="v$.priorityType.$errors.length" class="form-error-message">
                {{ v$.priorityType.$errors[0].$message }}
              </p>
            </div>
            <div class="form-item flex-1" :class="{ 'has-error': v$.dueDate.$errors.length }">
              <span class="form-label">Due Date</span>
              <date-picker
                  id="dueDateField"
                  v-model="state.dueDate"
                  :enable-time-picker="false"
                  :format="formatDate"
                  :preview-format="'dd/MM/yyyy'"
                  :min-date="now"
                  placeholder="Select the date"
              />
              <p v-if="v$.dueDate.$errors.length" class="form-error-message">
                {{ v$.dueDate.$errors[0].$message }}
              </p>
            </div>
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

          <div class="form-item">
            <span class="form-label">Upload Evidence</span>
            <EvidenceUpload></EvidenceUpload>
          </div>
        </template>

        <template v-if="currentTabIndex === 1">
          <div class="mb-8">
            <div class="flex">
              <div class="form-item flex-1">
                <span class="form-label">Analysis Type</span>
                <vue-select
                    id="analysisField"
                    v-model="selectedAnalysisCount"
                    :options="analysisOptions"
                    label="name"
                    :clearable="false"
                    :reduce="(usr: any) => usr.count"
                    placeholder="Choose the Analysis Type"
                />
<!--                <p v-if="!state.whys.length" class="form-error-message">-->
<!--                  Value is required-->
<!--                </p>-->
              </div>
              <div class="flex flex-1" />
            </div>
            <div v-if="state.whys.length">
              <RiskanalysisFields v-for="(field, i) in state.whys" ref="childComponentRefs" :key="i"
                                  :analysis-fields="field"/>
            </div>
            <div v-else class="text-center">Please select any option from analysis types.</div>
          </div>
        </template>

        <template v-if="currentTabIndex === 2">
          <div  class="mb-6">
            <div class="font-semi-bold text-gray-400 text-lg mb-4 flex">
              <div class="flex-grow uppercase">MITIGATION</div>
              <div id="addMitigationBtn" class="flex items-center justify-end text-primary-500 cursor-pointer"
                   @click="onUpdateMitigation(-1)">
                <font-awesome-icon icon="circle-plus" class="mr-2"/>
                <span class="text-base">Add</span>
              </div>
            </div>

            <table v-if="state.mitigations.length > 0" class="mitigations-table w-full text-left mb-4">
              <thead class="font-bold bg-gray-100">
              <tr>
                <th scope="col" class="px-4 py-3 text-center w-24">Is Action</th>
                <th scope="col" class="px-4 py-3">Content</th>
                <th scope="col" class="px-4 py-3 w-20">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
              </thead>

              <tbody>
              <tr
                  v-for="(mitigation, index) in state.mitigations"
                  :key="index"
                  class="bg-white"
                  :class="{ 'border-t': index > 0 }"
              >
                <td class="px-4 py-3 text-center">
                  <font-awesome-icon
                      v-if="mitigation.isActionItem"
                      icon="circle-check"
                      class="text-primary-500 text-lg"
                  />
                </td>
                <td class="px-4 py-3">
                  {{ mitigation.content }}
                </td>
                <td class="px-4 py-3 text-gray-500 text-right">
                  <div v-if="mitigation?.action?.status !== 'APPROVED'">
                    <font-awesome-icon
                        id="delMitigationBtn"
                        icon="trash"
                        class="mr-2 cursor-pointer"
                        @click="onShowDeleteConfirmation(index)"
                    />
                    <font-awesome-icon id="editMitigationBtn" icon="pen" class="cursor-pointer"
                                       @click="onUpdateMitigation(index)"/>
                  </div>
                  <div v-else>APPROVED</div>
                </td>
              </tr>
              </tbody>
            </table>
            <div v-else class="flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20">
              No Mitigation
            </div>
          </div>
        </template>

        <template v-if="currentTabIndex === 3">
          <FormStepFour :risk-ids="state.riskIds" @get-selected-risks="(val :string[]) => state.riskIds = val"></FormStepFour>
        </template>

        <template v-if="currentTabIndex === 4">
          <FormStepFive :leg-reg-ids="state.legRegIds" @get-selected-legs="(val :string[]) => state.legRegIds = val"></FormStepFive>
        </template>

        <template v-if="currentTabIndex === 5">
          <FormStepSix  :org-leg-ids="state.orgLegIds" @get-selected-subs-legs="(val :string[]) => state.orgLegIds = val"></FormStepSix>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <AppButton
                v-if="!props.isUpdatingIssue"
                id="draftBtn"
                type="primary"
                :loading="draftLoading"
                :hidden="currentTabIndex !== 0"
                @click="saveIssueDraft"
            >
              Save Draft
            </AppButton>
            <button
                v-show="currentTabIndex > 0"
                id="backTabBtn"
                :disabled="draftLoading"
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
            <AppButton
                v-if="!props.isUpdatingIssue"
                id="draftBtn2"
                type="primary"
                class="mr-2"
                :loading="draftLoading"
                :disabled="isLoading"
                :hidden="currentTabIndex === 0"
                @click="saveIssueDraft"
            >
              Save Draft
            </AppButton>
            <AppButton
                id="nextTabBtn"
                :hidden="currentTabIndex === tabs.length - 1"
                :disabled="draftLoading"
                type="primary"
                @click="onNext"
            >
              Next
            </AppButton>
            <AppButton
                v-if="currentTabIndex === tabs.length - 1"
                id="formActionBtn"
                :loading="isLoading"
                :disabled="draftLoading"
                type="primary"
                @click="submit"
            >{{ props.item && props.isUpdatingIssue ? 'Update' : 'Submit' }}</AppButton
            >
          </div>
        </div>
      </form>
    </template>
  </AppModal>

  <RiskMitigationForm
      v-if="showMitigationModal"
      :assignees="assigneesWithTempUsers"
      :mitigation="mitigationIndex >= 0 ? state.mitigations[mitigationIndex] : undefined"
      @open-add-user-modal="(val :Boolean) => emits('showUserModal', val)"
      @submit="onSubmitMitigationModal"
      @close="showMitigationModal = false"
  />

  <confirm-modal
      v-if="isConfirmModalShow"
      title="Confirmation"
      :on-ok="onDeletedMitigation"
      @close="isConfirmModalShow = false"
  ><template #body>Do you want to delete this mitigation strategy?</template></confirm-modal>

  <confirm-modal
      v-if="isDraftConfirmationShow"
      title="Confirmation"
      :has-footer="false"
      @close="isDraftConfirmationShow = false"
  >
    <template #body>
      <div class="leading-relaxed">Do you want to save your progress in draft?</div>
      <div class="flex items-center justify-center gap-2 pt-5">
        <AppButton type="light" :disabled="confirmationDraftLoader" @click="emits('close', false)">No</AppButton>
        <AppButton id="confirmOKBtn" type="primary" :loading="confirmationDraftLoader" @click="savingDraft">Yes</AppButton>
      </div>
    </template>
  </confirm-modal>
</template>

