<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { storeToRefs } from 'pinia'
import { OrgDepartment } from '@/core/models/org-department.model'
import { OrgLocation } from '@/core/models/org-location.model'
import { getActionReport, getGeneralReport, getRiskHeatMap, getRiskReport } from '@/core/services/report.service'
import { ReportGeneral, ReportResponse, RiskReportResponse } from '@/core/models/report.model'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { useRiskMatrixStore } from '@/store/use-risk-matrix.store'
import ReportNumberBox from './components/ReportNumberBox.vue'
import ActionPieChart from './components/ActionPieChart.vue'
import RiskBarChart from './components/RiskBarChart.vue'
import ScoreGaugeChart from './components/ScoreGaugeChart.vue'
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import RiskHeatMap from './components/RiskHeatMap.vue'
import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'
import { useRouter } from 'vue-router'
import { RouteNames } from '@/core/models/app-router.model'

interface FilterState {
  locIds: string[]
  depIds: string[]
}

const filterState = ref<FilterState>({
  locIds: [],
  depIds: []
})
const isLoading = ref<boolean>(true)
const generalReport = ref<ReportGeneral>({
  risksOverThreshold: 0,
  risksInProgress: 0,
  actionsPastDueDate: 0,
  actionsInProgress: 0,
  riskScore: -1,
  managementControlScore: -1
})
const actionReport = ref<ReportResponse[]>([])
const riskReport = ref<RiskReportResponse[]>([])
const riskHeatMap = ref<ReportResponse[]>([])

const router = useRouter()
const locationsStore = useOrgLocationStore()
const departmentsStore = useOrgDepartmentStore()
const riskMatrixStore = useRiskMatrixStore()
const { locationDropdown } = storeToRefs(locationsStore)
const { departmentDropdown } = storeToRefs(departmentsStore)
const { exposureLevels, consequences, likelihoods } = storeToRefs(riskMatrixStore)

watch(filterState.value, async () => {
  try {
    const [_generalReport, _actionReport, _riskReport, _riskHeatMap] = await Promise.all([
      getGeneralReport(filterState.value.depIds, filterState.value.locIds),
      getActionReport(filterState.value.depIds, filterState.value.locIds),
      getRiskReport(filterState.value.depIds, filterState.value.locIds),
      getRiskHeatMap(filterState.value.depIds, filterState.value.locIds)
    ])

    generalReport.value = {
      risksOverThreshold: Math.round(_generalReport.risksOverThreshold * 100),
      risksInProgress: Math.round(_generalReport.risksInProgress * 100),
      actionsPastDueDate: Math.round(_generalReport.actionsPastDueDate * 100),
      actionsInProgress: Math.round(_generalReport.actionsInProgress * 100),
      riskScore: Math.round(_generalReport.riskScore),
      managementControlScore: Math.round(_generalReport.managementControlScore)
    }

    actionReport.value = _actionReport
    riskReport.value = _riskReport
    riskHeatMap.value = _riskHeatMap
    isLoading.value = false
  } catch (e) {
    isLoading.value = false
  }
})

// const onHeatMapItemClicked = (rme: RiskMatrixExposureLevel) => {
//   console.log(rme)

//   router.push({
//     name: RouteNames.RISK_MANAGEMENT,
//     query: {
//       ires: [rme.rmeId],
//       departments: filterState.value.depIds,
//       locations: filterState.value.locIds,
//       status: 'IN_PROGRESS'
//     }
//   })
// }

const onHeatMapItemClicked = (payload: any) => {
  // console.log(payload.rme)
  // console.log(payload.cell)

  router.push({
    name: RouteNames.RISK_MANAGEMENT,
    query: {
      ires: [payload.rme.rmeId],
      departments: filterState.value.depIds,
      locations: filterState.value.locIds,
      notStatus: ['DRAFT'],
      cellValue: payload.cell
    }
  })
}

onMounted(() => {
  riskMatrixStore.getRiskMatrix().then(() => {
    Promise.all([locationsStore.getLocations(), departmentsStore.getDepartments()]).then(([locs, deps]) => {
      filterState.value.depIds = (deps as unknown as OrgDepartment[]).map((it) => it.depId)
      filterState.value.locIds = (locs as unknown as OrgLocation[]).map((it) => it.locId)
    })
  })
})
</script>

<template>
  <div class="relative h-full overflow-hidden">
    <ComponentLoading :loading="isLoading" />
    <div class="container-xl h-full pb-6 overflow-auto">
      <PageHeader title="Organisation Dashboard">
        <FilterDropDown v-model="filterState.depIds" clearable :items="departmentDropdown" title="Departments" />
        <FilterDropDown v-model="filterState.locIds" clearable :items="locationDropdown" title="Locations" />
      </PageHeader>
      <div class="space-y-6">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
          <report-number-box class="flex-1" :value="generalReport.risksOverThreshold" title="Risks over threshold" />
          <report-number-box class="flex-1" :value="generalReport.risksInProgress" title="Risks in progress" />
          <report-number-box class="flex-1" :value="generalReport.actionsPastDueDate" title="Actions past due date" />
          <report-number-box class="flex-1" :value="generalReport.actionsInProgress" title="Actions in progress" />
        </div>
        <div class="space-y-6 md:flex md:space-y-0 md:space-x-6">
          <div class="flex flex-col md:flex-[3] rounded-md px-6 py-6 bg-base-white">
            <h5 class="mb-5 font-bold">Risks By Department</h5>
            <div class="flex-1">
              <risk-bar-chart :data="riskReport" :exposure-levels="exposureLevels" />
            </div>
          </div>
          <div class="md:flex-1 flex flex-col rounded-md px-6 py-6 bg-base-white">
            <h5 class="mb-5 font-bold">Action Management</h5>
            <div class="flex-1">
              <action-pie-chart :data="actionReport" />
            </div>
          </div>
        </div>
        <div class="space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
          <div class="space-y-6 sm:flex sm:space-x-6 sm:space-y-0 lg:flex-col lg:space-y-6 lg:space-x-0 lg:flex-1">
            <div class="flex flex-col flex-1 rounded-md px-6 py-6 bg-base-white">
              <h5 class="mb-5 font-bold">Risk Score</h5>
              <div>
                <score-gauge-chart
                  v-if="generalReport.riskScore >= 0"
                  :exposure-levels="exposureLevels"
                  :data="generalReport.riskScore"
                />
              </div>
            </div>
            <div class="flex flex-col flex-1 rounded-md px-6 py-6 bg-base-white">
              <h5 class="mb-5 font-bold">Management Control Score</h5>
              <div>
                <score-gauge-chart
                  v-if="generalReport.managementControlScore >= 0"
                  :exposure-levels="exposureLevels"
                  :data="generalReport.managementControlScore"
                />
              </div>
            </div>
          </div>
          <div class="flex flex-col lg:flex-[2] rounded-md px-6 py-6 bg-base-white">
            <h5 class="mb-5 font-bold">Heat Map</h5>
            <div class="flex-1">
              <RiskHeatMap
                :data="riskHeatMap"
                :exposure-levels="exposureLevels"
                :likelihoods="likelihoods"
                :severities="consequences"
                @on-item-clicked="onHeatMapItemClicked($event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-select {
  background-color: white;
}
</style>
