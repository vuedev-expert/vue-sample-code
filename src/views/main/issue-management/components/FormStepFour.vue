<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {formatDate, getUserName} from "@/core/helpers/common";
import {storeToRefs} from "pinia";
import {useRiskStore} from "@/store/use-risk-store";
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { issueRiskTableCol, issueRiskExportCols } from "@/core/constants/table-constants";
import {useHazardStore} from "@/store/use-hazard-store";
import {SortInfo} from "@/core/models/table.model";
import {Risk, RiskStatusText} from "@/core/models/risk.model";
import { RiskReport } from "@/core/models/issue-model";
import {exportCSVFile} from "@/core/helpers/csv-export";
import {useToast} from "vue-toastification";

const emits = defineEmits(['getSelectedRisks'])
const props= defineProps<{ riskIds: string[] }>()

const riskStore = useRiskStore()
const hazardStore = useHazardStore()
const toast = useToast()

const { risks, status } = storeToRefs(riskStore)
const { hazards } = storeToRefs(hazardStore)

const searchedVal = ref<string>('')
const adjustedRisks = computed(() => {
  let allRisks = risks.value.map((risk) => ({
    ...risk,
    username: getUserName(risk.owner),
    formattedDueDate: formatDate(risk.dueDate)
  }))
  if (searchedVal.value.length) {
    return allRisks.filter((risk) => risk?.description?.toLowerCase().includes(searchedVal.value.toLowerCase()))
  } else return allRisks
})
const selectAllRisks = ref(false)
watch(() => adjustedRisks.value, () => {
  selectAllRisks.value = props.riskIds.length === risks.value.length
})

onMounted(async () => {
  if (!risks.value.length) await doSearch()
  selectAllRisks.value = props.riskIds.length === risks.value.length
})

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}
const currentSort = ref<SortInfo>({ ...defaultSort })

const doSearch = () => {
  return riskStore.fetchRisks({ isReport: 'true' })
}

const selectedRows = ref<String[]>(props.riskIds || [])
const toggleSelectAll = () => {
  const filtered = adjustedRisks.value.map((item :Risk) => item.rskId)
  const allRisk = risks.value.map((item :Risk) => item.rskId)
  if (selectAllRisks.value) {
    if (searchedVal.value.length) selectedRows.value = allRisk.filter(riskId => filtered.includes(riskId))
    else selectedRows.value = filtered;
  }
  else {
    if (searchedVal.value.length) selectedRows.value = allRisk.filter(riskId => !filtered.includes(riskId))
    else selectedRows.value = []
  }
}

const isIndeterminate = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.length < risks.value.length
})

const exportRisks = () => {
  if (!selectedRows.value.length) {
    toast.error('Please select at least one risk to export')
    return
  }
  const risks = adjustedRisks.value
  let exportRisks = risks
      .filter((a) => selectedRows.value.includes(a.rskId))
      .map((a) => {
          return {
            risk: a.description,
            source: a.riskSource?.name ?? '',
            riskHazard: a.riskHazard?.hazardType?.name ?? '--',
            owner: a.username,
            location: a.locations?.filter((loc :any) => loc).map((i) => i.name).join(', ') || '--',
            department: a.departments?.filter((dep :any)=> dep).map((i) => i.name).join(', ') || '--',
            dueDate: a.formattedDueDate ?? '',
            status: RiskStatusText[a.status] ?? ''
          } as RiskReport
      })
  exportCSVFile(issueRiskExportCols, exportRisks)
}

watch(() => selectedRows.value, (val) => emits('getSelectedRisks', val),
    { deep: true })
</script>

<template>
  <div class="risk-table pb-8 pt-4">
    <h2 class="text-xl">Risks</h2>
    <div class="relative my-3 w-3/12">
      <input
          id="searchRisk"
          v-model="searchedVal"
          type="text"
          placeholder="Search the Risk"
          class="form-input"
      />
      <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
    </div>
    <div v-if="adjustedRisks.length" class="flex items-center justify-between pb-5">
      <h4>Connect your existing risks with the issue</h4>
      <AppButton
          v-if="status === 'idle'"
          id="riskFileExport"
          icon="file-export"
          type="primary"
          @click="exportRisks">
        Export CSV
      </AppButton>
    </div>
    <div class="overflow-y-auto flex-1 relative" style="max-height: 400px;">
      <ComponentLoading :loading="status === 'loading'" />
      <table v-if="adjustedRisks.length" class="lh-table">
        <thead class="font-bold bg-gray-100">
        <tr>
          <th v-for="col in issueRiskTableCol" :key="col.label" :class="[col.class]" scope="col">
            <SortableTableHead
                :class="col.class"
                :sort-col="currentSort"
                :col="col"
                @on-sort="() => {}"
            >
              <input
                  v-if="col.allowCB"
                  v-model="selectAllRisks"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                  type="checkbox"
                  class="rounded mr-3 border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
              />
            </SortableTableHead>
          </th>
          <th scope="col" class="px-2 py-6"></th>
        </tr>
        </thead>

        <tbody>
        <template v-for="risk in adjustedRisks" :key="risk.rskId">
          <tr class="bg-white border-b">
            <td class="min-w-[220px] max-w-[320px]">
              <input
                  v-model="selectedRows"
                  :value="risk.rskId"
                  class="rounded mr-3 border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
                  @change="selectAllRisks = selectedRows.length === risks.length"
                  type="checkbox"
              />
              {{ risk.description }}
            </td>
            <td class="min-w-[180px]">{{ risk.riskSource?.name ?? '-' }}</td>
            <td
                v-if="risk?.riskHazard?.hazardTypeId"
                class="min-w-[180px] hover:underline cursor-pointer"
            >
              {{ hazards.find((i) => i.hazardTypeId == risk?.riskHazard?.hazardTypeId)?.name }}
            </td>
            <td class="min-w-[180px]" v-else>---</td>
            <td class="font-bold">
              {{ risk.username }}
            </td>
            <td>
              <div v-if="risk.location" class="whitespace-nowrap">
                <font-awesome-icon icon="location-dot" class="mr-2" />
                {{ risk.location.name }}
              </div>
            </td>
            <td>
              <div v-if="risk.department" class="whitespace-nowrap">
                <font-awesome-icon icon="building" class="mr-2" />

                {{ risk.department.name }}
              </div>
            </td>
            <td class="italic">{{ risk.formattedDueDate || '-' }}</td>
            <td class="text-center !overflow-visible">
              <AppStatus
                  :status="risk.status"
                  type="risk"
              />
            </td>
          </tr>
        </template>
        </tbody>
      </table>
      <div v-else class="text-center min-h-[120px] flex items-center justify-center">No Risk Found</div>
    </div>
    <div class="text-right pt-5">
      Total: {{ adjustedRisks.length }}
    </div>
  </div>
</template>
