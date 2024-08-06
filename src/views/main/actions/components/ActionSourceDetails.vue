<script setup lang="ts">
import {computed, ref, onUnmounted, watchEffect} from 'vue'
import {Action} from "@/core/models/action.model";
import {Issue} from "@/core/models/issue-model";
import {Risk} from "@/core/models/risk.model";
import {useRiskLookups} from "@/core/helpers/risk-service";
import {storeToRefs} from "pinia";
import {formatDate} from '@/core/helpers/common'
import {useUserSetupStore} from "@/store/use-user-setup-store";
import {useOrgDepartmentStore} from "@/store/use-org-department-store";
import {useOrgLocationStore} from "@/store/use-org-location-store";
import {RiskMatrixExposureLevel} from "@/core/models/risk-matrix.model";
import {useRiskMatrixStore} from "@/store/use-risk-matrix.store";
import {useIssueStore} from "@/store/use-issue-store";
import EvidenceUpload from '@/views/main/issue-management/components/EvidenceUpload.vue'

const props = defineProps<{ action: Action }>()
const emits = defineEmits(['close'])

const userStore = useUserSetupStore()
const orgStore = useOrgDepartmentStore()
const locStore = useOrgLocationStore()
const issueStore = useIssueStore()

const { isoStandards } = useRiskLookups()
const riskMatrixStore = useRiskMatrixStore()

const { departmentDropdown } = storeToRefs(orgStore)
const { locationDropdown } = storeToRefs(locStore)
const { owners } = storeToRefs(userStore)
const { attachments } = storeToRefs(issueStore)
const { likelihoods, consequences, exposureLevels } = storeToRefs(riskMatrixStore)

const issueDetails = ref<Issue>()
const riskDetails = ref<Risk>()

watchEffect(() => {
  if (props.action.actionSource.name === 'Issue') {
    issueDetails.value = props.action.issue
    if (props.action?.issue) attachments.value = props.action.issue.attachments
  }
  else if (props.action.actionSource.name === 'Risk Module') riskDetails.value =  props.action.risk
})

onUnmounted(() => attachments.value = [])

const beforeExposureLevel = computed<RiskMatrixExposureLevel | null>(() => {
  if (riskDetails.value?.beforeRmlId && riskDetails.value?.beforeRmsId) {
    try {
      const rml = likelihoods.value.find((it) => it.rmlId === riskDetails.value?.beforeRmlId)
      const rms = consequences.value.find((it) => it.rmsId === riskDetails.value?.beforeRmsId)
      const value = +rml!.value * +rms!.value
      return exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value) ?? null
    } catch (e) {
      console.log('Cannot find the exposure level before mitigating')
    }
  }

  return null
})

const beforeExposureValue = computed<number>(() => {
  const rml = likelihoods.value.find((it) => it.rmlId === riskDetails.value?.beforeRmlId)
  const rms = consequences.value.find((it) => it.rmsId === riskDetails.value?.beforeRmsId)
  return +rml!.value * +rms!.value
})

const maxExposureValue = computed(() => {
  if (exposureLevels.value.length === 0) return 1
  else return Math.max(...exposureLevels.value.map((it) => it.toValue))
})

const afterExposureLevel = computed<RiskMatrixExposureLevel | null>(() => {
  if (riskDetails.value?.afterRmlId && riskDetails.value?.afterRmsId) {
    try {
      const rml = likelihoods.value.find((it) => it.rmlId === riskDetails.value?.afterRmlId)
      const rms = consequences.value.find((it) => it.rmsId === riskDetails.value?.afterRmsId)
      const value = rml!.value * rms!.value
      return exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value) ?? null
    } catch (e) {
      console.log('Cannot find the exposure level after mitigating')
    }
  }

  return null
})

const afterExposureValue = computed<number>(() => {
  const rml = likelihoods.value.find((it) => it.rmlId === riskDetails.value?.afterRmlId)
  const rms = consequences.value.find((it) => it.rmsId === riskDetails.value?.afterRmsId)
  return +(rml?.value ?? 0) * +(rms?.value ?? 0)
})
</script>

<template>
  <AppModal
      :has-footer="false"
      title="Source Details"
      @close="(value :any) => emits('close', value)"
  >
    <template #body>
      <form v-if="issueDetails">
        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">GENERAL INFORMATION</div>
        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea
              id="descField"
              :value="issueDetails.description"
              class="form-input"
              placeholder="Enter the description"
              rows="4"
          />
        </div>

        <div class="flex flex-col md:flex-row">
          <div class="form-item flex-1 md:mr-4">
            <span class="form-label">ISO Standard</span>
            <vue-select
                v-model="issueDetails.isoId"
                disabled
                :options="isoStandards"
                :reduce="(iso: any) => iso.isoId"
                label="name"
                :clearable="false"
                placeholder="ISO Standard"
            />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Owner</span>
            <vue-select
                v-model="issueDetails.ownId"
                disabled
                :options="owners"
                :reduce="(iso: any) => iso.usrId"
                :get-option-label="(usr: any) => [usr.firstName, usr.lastName].join(' ')"
                :clearable="false"
                placeholder="Owner"
            />
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-4">RELATED INFORMATION</div>

        <div class="flex flex-col md:flex-row md:gap-4">
          <div class="form-item flex-1 mb-2 md:mb-6">
            <span class="form-label">Location</span>
            <vue-select
                v-model="issueDetails.locId"
                :options="locationDropdown"
                label="name"
                :reduce="(dept: any) => dept.id"
                :clearable="false"
                disabled
            />
          </div>

          <div class="form-item flex-1 mb-6">
            <span class="form-label">Departments</span>
            <vue-select
                v-model="issueDetails.depIds"
                :options="departmentDropdown"
                label="name"
                :reduce="(dept: any) => dept.id"
                :clearable="false"
                multiple
                disabled
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1">
            <span class="form-label">Issue Type</span>
            <input readonly class="form-input" :value="issueDetails?.issueType" />
          </div>
          <div class="form-item flex-1">
            <span class="form-label">Date of Occurrence</span>
            <input readonly class="form-input" :value="formatDate(issueDetails?.dateOfOccurrence)" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-2 md:gap-4">
          <div v-if="issueDetails?.issueType === 'Others'" class="form-item mb-0 flex-1">
            <span class="form-label">Others</span>
            <input readonly class="form-input" :value="issueDetails?.othersText" />
          </div>
          <div v-else class="flex-1" />
          <div class="form-item flex-1">
            <span class="form-label">Priority Type</span>
            <input readonly class="form-input capitalize" :value="issueDetails.priorityType" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1">
            <span class="form-label">Due Date</span>
            <input readonly class="form-input" :value="formatDate(issueDetails?.dueDate)" />
          </div>
          <div class="flex-1"></div>
        </div>

        <template v-if="issueDetails.whys">
          <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK ANALYSIS</div>
          <template v-for="(field, i) in issueDetails.whys" :key="i">
            <div class="flex flex-col md:flex-row gap-4">
              <div class="form-item flex-1">
                <span class="form-label">Question</span>
                <input readonly class="form-input" :value="field?.question || '---'"/>
              </div>
              <div class="form-item flex-1">
                <span class="form-label">Answer</span>
                <input readonly class="form-input" :value="field?.answer || '---'"/>
              </div>
            </div>
          </template>
        </template>

        <div class="form-item">
          <span class="form-label">Evidence</span>
          <EvidenceUpload :disabled="true"></EvidenceUpload>
        </div>
      </form>

      <form v-if="riskDetails">
        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">GENERAL INFORMATION</div>

        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea
              :value="riskDetails?.description"
              class="form-input"
              readonly
              placeholder="Enter the description"
              rows="3"
          />
        </div>

        <div class="flex">
          <div class="form-item flex-1">
            <span class="form-label">ISO Standard</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.isoStandard?.name" />
          </div>
          <div class="flex-1" />
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-4">RELATED INFORMATION</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4">
            <span class="form-label">Source</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.riskSource.name" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Legal Requirement</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.legalRegister?.orgLegislation?.legislation?.name ?? '---'" />
          </div>
        </div>

        <div class="flex">
          <div class="form-item flex-1 mr-4">
            <span class="form-label">Department</span>
            <span
                v-for="(item, index) in riskDetails?.departments?.filter((val :any) => val)?.map(({ name }: any) => name).slice(0, 2)"
                :key="index"
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-neutral-200 uppercase last:mr-0 mr-1 custom-lable-natural"
            >{{ item }}</span>
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Location</span>
            <div>
              <span
                  v-for="(item, index) in riskDetails?.locations?.filter((val :any) => val)?.map(({ name }: any) => name).slice(0, 2)"
                  :key="index"
                  class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-neutral-200 uppercase last:mr-0 mr-1 custom-lable-natural"
              >{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK RATING</div>
        <div class="flex">
          <div class="form-item flex-1 mr-4">
            <span class="form-label">Likelihood</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.beforeRml?.name" />
          </div>

          <div class="form-item flex-1 mr-4">
            <span class="form-label">Consequence</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.beforeRms?.name" />
          </div>

          <div class="form-item flex-1">
            <div class="form-label">Risk exposure</div>
            <div class="pt-2">
              <RiskExposure
                  v-if="beforeExposureLevel"
                  :color="beforeExposureLevel.color"
                  :name="beforeExposureLevel.name"
                  :value="beforeExposureValue"
                  :max-value="maxExposureValue"
              >
              </RiskExposure>
              <div v-else>--</div>
            </div>
          </div>
        </div>

        <div class="font-semi-bold text-gray-400 text-lg mb-4 flex">
          <div class="flex-grow uppercase">MITIGATION</div>
        </div>

        <table v-if="riskDetails?.mitigations.length > 0" class="w-full text-left mb-4">
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
              v-for="(mitigation, index) in riskDetails?.mitigations"
              :key="index"
              class="bg-white"
              :class="{ 'border-t': index > 0 }"
          >
            <td class="px-4 py-3 text-center">
              <font-awesome-icon v-if="mitigation.isActionItem" icon="circle-check" class="text-primary-500 text-lg" />
            </td>
            <td class="px-4 py-3">
              {{ mitigation.content }}
            </td>
            <td class="px-4 py-3 text-gray-500 text-right"></td>
          </tr>
          </tbody>
        </table>
        <div v-else class="mb-6 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md h-20">
          No Mitigation
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK RATING AFTER MITIGATION</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4">
            <span class="form-label">Likelihood</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.afterRml?.name" />
          </div>

          <div class="form-item flex-1 mr-4">
            <span class="form-label">Consequence</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.afterRms?.name" />
          </div>

          <div class="form-item flex-1">
            <div class="form-label">Risk exposure</div>
            <div class="pt-2">
              <RiskExposure
                  v-if="afterExposureLevel"
                  :color="afterExposureLevel.color"
                  :name="afterExposureLevel.name"
                  :value="afterExposureValue"
                  :max-value="maxExposureValue"
              >
              </RiskExposure>
              <div v-else>--</div>
            </div>
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">OTHERS</div>

        <div class="flex">
          <div class="form-item flex-1 mr-4">
            <span class="form-label">Owner</span>
            <input readonly class="form-input" label="name" :value="riskDetails?.owner?.fullName" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Due Date</span>
            <input readonly class="form-input" :value="formatDate(riskDetails?.dueDate)" />
          </div>
        </div>

        <div class="form-item">
          <span class="form-label">Remarks</span>
          <textarea
              :value="riskDetails?.remarks"
              readonly
              type="text"
              class="form-input"
              placeholder="Enter the remarks"
              rows="3"
          />
        </div>
      </form>
    </template>
  </AppModal>
</template>

<style>
textarea:disabled{
  background-color: red;
}
</style>
