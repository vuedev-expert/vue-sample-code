<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RouteNames } from '@/core/models/app-router.model'
import { useToast } from 'vue-toastification'
// @ts-ignore
import VueHighcharts from 'vue3-highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import Highcharts from 'highcharts'
import HighchartsExportData from 'highcharts/modules/export-data'
import { getDashboardReport } from '@/core/services/report.service'

import FilterDropDown from '@/core/components/FilterDropDown.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import LegislationUpdateContainer from "./components/LegislationUpdateContainer.vue"
import RiskHeatMap from './components/RiskHeatMap.vue'
import { ActionStatus } from '@/core/models/action.model'
import { Risk } from '@/core/models/risk.model'
import { OrgDepartment } from '@/core/models/org-department.model'
import { OrgLocation } from '@/core/models/org-location.model'
import { LegalRegister } from '@/core/models/legislation.model'
import {
  DashboardReport,
  RiskStats,
  ActionStats,
  IssueStats,
  ReportResponse,
  RiskReportResponse,
  LegislationStats
} from '@/core/models/report.model'

import {
  actionChartOptions,
  calculateActionData,
  calculateLegalRegister,
  calculateRiskRegister,
  riskDeptChartOptions,
  lineChartOptions
} from '@/core/helpers/charts'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { RiskMatrix, RiskMatrixExposureLevel, RiskMatrixItem } from '@/core/models/risk-matrix.model'
import {QueryParams} from "@/core/models/query-param.model";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/store/use-auth-store";
import AppButton from "@/core/components/AppButton.vue";
import LegislationUpdatePieChart from "@/views/main/dashboard/components/LegislationUpdatePieChart.vue";
import LegislationUpdateBarChart from "@/views/main/dashboard/components/LegislationUpdateBarChart.vue";
import {useLegislationLibrary} from "@/store/use-legislation-store";
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
    BarElement,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale
)

interface FilterState {
  locIds: string[]
  depIds: string[]
}

const filterState = ref<FilterState>({
  locIds: [],
  depIds: []
})

const isLoading = ref<boolean>(false)
const riskStatReport = ref<RiskStats>({
  risksOverThreshold: 0,
  risksInProgress: 0,
  risksInAwaitingReview: 0,
  risksInOpen: 0
})
const actionStatReport = ref<ActionStats>({
  actionsInApproved: 0,
  actionsInOpen: 0,
  actionsInRejected: 0,
  actionsInReview: 0
})
const issueStatReport = ref<IssueStats>({
  issuesInOpen: 0,
  issuesInProgress: 0,
  issuesOverThresholds: 0,
  issuesInAwaitingReview: 0
})
const legislationStatReport = ref<LegislationStats>({
  legalRegs: 0,
  risks: 0,
  read: 0,
  unread: 0,
  updatedActs: 0,
  actDetails: [],
  riskIds: [],
  legalRegIds: []
})

const actionReport = ref<ReportResponse[]>([])
const riskReport = ref<RiskReportResponse[]>([])
const riskHeatMap = ref<ReportResponse[]>([])
const riskRecordReport = ref<Risk[]>([])
const legalRecordReport = ref<LegalRegister[]>([])
const departments = ref<any>([])
const locations = ref<any>([])
const consequences = ref<RiskMatrixItem[]>([])
const likelihoods = ref<RiskMatrixItem[]>([])
const exposureLevels = ref<RiskMatrixExposureLevel[]>([])
let displayLegisLibChart = ref<boolean>(true)
let displayRiskLineChart = ref<boolean>(true)
let displayActionChart = ref<boolean>(true)

HighchartsMore(Highcharts)
HighchartsExportData(Highcharts)

const router = useRouter()
const authStore = useAuthStore()
const { me, userId, isManager } = storeToRefs(authStore)

let barArray = ref<any>([])
let heatArray = ref<any>([])
let barChartDepts = ref<any>([])
let barChartKey = ref(0)
let riskLineRegister = ref<any>({})
let legisLibChart = ref<any>({})
let actionPieChart = ref<any>({})
let selectedRiskFilter = ref<number>(0)
let selectedLegalFilter = ref<number>(0)

const initialDashboardCreated = ref<boolean>(true)
const isMissingDeptLoc = ref<boolean>(false)

const toast = useToast()
const legisStore = useLegislationLibrary()

function renderDashboard(reportData :DashboardReport) {
  assignStatData(reportData.riskStats, reportData.actionStats, reportData.issueStats, reportData.legislationUpdates)
  exposureLevels.value = reportData.riskMatrix.exposureLevels
  consequences.value = reportData.riskMatrix.consequences
  likelihoods.value = reportData.riskMatrix.likelihoods
  legalRecordReport.value = reportData.allLegislations
  riskReport.value = reportData.risksByDepts
  riskHeatMap.value = reportData.risksByRME
  riskRecordReport.value = reportData.allRisks
  actionReport.value = reportData.actions

  barArray.value = []
  barChartDepts.value = []
  if (exposureLevels.value?.length) {
    // calculateGaugeChart(exposureLevels.value)
    // addGaugeLabels(exposureLevels.value)
    let color = exposureLevels.value.map((level: any) => level.color)
    let label = exposureLevels.value.map((level: any) => level.name)
    for (let i = 0; i < exposureLevels.value.length; i++) {
      barArray.value.push({
        name: label[i],
        data: new Array(riskReport.value.length).fill(0) || [],
        pointWidth: 12,
        color: color[i]
      })
    }
    if (filterState.value.depIds.length) {
      riskReport.value.forEach((dept, x) => {
        barChartDepts.value.push(dept.label)
        if (dept?.value?.length) {
          dept.value.forEach((risk) => {
            let labelIndex = label.findIndex((val) => val === risk.label)
            if (labelIndex > -1) barArray.value[labelIndex].data[x] = risk.value
          })
        }
      })
    }
    barChartKey.value++
  }

  if (!displayRiskLineChart.value) displayRiskLineChart.value = true
  if (riskRecordReport.value?.length > 0) {
    riskLineRegister.value = calculateRiskRegister(riskRecordReport.value, selectedRiskFilter.value)
  } else displayRiskLineChart.value = false

  if (!displayLegisLibChart.value) displayLegisLibChart.value = true
  if (reportData?.allLegislations?.length > 0) {
    legisLibChart.value = calculateLegalRegister(reportData.allLegislations, selectedLegalFilter.value)
  } else displayLegisLibChart.value = false


  if (!displayActionChart.value) displayActionChart.value = true
  if (reportData?.actions?.length) actionPieChart.value = calculateActionData(reportData.actions)
  else displayActionChart.value = false
}

function assignStatData(riskStat :RiskStats, actionStat :ActionStats, issueStats :IssueStats, legislationStats :LegislationStats) {
  riskStatReport.value = riskStat
  actionStatReport.value = actionStat
  issueStatReport.value = issueStats
  legislationStatReport.value = legislationStats
}

watch(filterState.value, async (filterValues) => {
  const deptLen :boolean = filterValues.depIds.length < 1, locLen :boolean = filterValues.locIds.length < 1
  if (deptLen || locLen) {
    toast.error(`Please select at least one ${deptLen && locLen ? 'Department and Location' : (locLen ? 'Location' : ( deptLen ? 'Department' : '' ))}`)
    return
  }
  try {
    if (initialDashboardCreated.value) {
      isLoading.value = true
      let reportData :DashboardReport = await getDashboardReport(filterState.value.depIds, filterState.value.locIds)
      await renderDashboard(reportData)
      isLoading.value = false
    }
  } catch (e) {
    isLoading.value = false
  }
})

onMounted(async () => {
  isLoading.value = true
  await authStore.getUserProfile()
  if (me?.value && me?.value?.departments.length && me?.value?.locations.length) {
    let depts = me?.value?.departments.map(dept => dept.depId)
    let locs = me?.value?.locations.map(dept => dept.locId)
    if (localStorage.getItem('filterOptions')) {
      const filters = JSON.parse(localStorage.getItem('filterOptions') || '')
      depts = filters.depts
      locs = filters.locs
    }
    const dashboardData :DashboardReport = await getDashboardReport(depts, locs)
    await populatingFilterDropdown(dashboardData.departments, dashboardData.locations)
    await renderDashboard(dashboardData)
  } else isMissingDeptLoc.value = true
  isLoading.value = false
})

function populatingFilterDropdown(depts :OrgDepartment[], locs :OrgLocation[]) {
  initialDashboardCreated.value = false
  let filteredDept = depts
  let filteredLoc = locs
  if (isManager.value && me.value) {
    filteredDept = me.value.departments
    filteredLoc = me.value.locations
  }
  departments.value = filteredDept.map((dept) => ({ id: dept.depId, name: dept.name, usrId: dept.usrId }))
  locations.value = filteredLoc.map((loc) => ({ id: loc.locId, name: loc.name, usrId: loc.usrId }))
  filterState.value.depIds = filteredDept.map((dept) => dept.depId)
  filterState.value.locIds = filteredLoc.map((loc) => loc.locId)
  if (localStorage.getItem('filterOptions')) {
    const filters = JSON.parse(localStorage.getItem('filterOptions') || '')
    filterState.value.depIds = filters.depts
    filterState.value.locIds = filters.locs
  }
}

// const exposures = computed(() => exposureLevels.value)

// const riskChartData = computed(() => {
//   gaugeChartOptions.series[0].data = [generalReport.value.riskScore]
//   return {
//     ...gaugeChartOptions,
//   }
// })
//
// const managementChartData = computed(() => {
//   return {
//     ...gaugeChartOptions,
//     series: [
//       {
//         name: 'Score',
//         data: [generalReport.value.managementControlScore],
//         tooltip: { valueSuffix: '' },
//         dataLabels: {
//           useHTML: true,
//           format: '<div style="text-align: center;">' +
//               '<span class="score-count">{y}</span>' +
//               '<span class="score">Score</span>' +
//               '</div>',
//           borderWidth: 0,
//           color:
//             (Highcharts.defaultOptions.title &&
//               Highcharts.defaultOptions.title.style &&
//               Highcharts.defaultOptions.title.style.color) ||
//             '#333333',
//           style: { fontSize: '16px' }
//         },
//         dial: {
//           radius: '50%',
//           backgroundColor: 'gray',
//           baseWidth: 10,
//           baseLength: '0%',
//           rearLength: '0%'
//         },
//         pivot: { backgroundColor: 'gray', radius: 5 }
//       }
//     ]
//   }
// })

const heatChartData = computed(() => {
  return {
    credits: { enabled: false },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'horizontal',
      y: 0
    },
    chart: {
      type: 'column',
      style: {
        borderRadius: '6px',
        background: '#FFFFFF',
        boxShadow: '0px 4px 20px rgba(13, 10, 44, 0.08)'
      },
      height: 566
    },
    title: {
      text: '',
      align: 'high',
      x: 15,
      y: 20,
      style: {
        fontFamily: 'Poppins',
        fontStyle: 'normal',
        fontSize: '20px',
        lineHeight: '24px',
        fontWeight: '500',
        color: '#1B2337',
        borderBottom: '2px solid black'
      }
    },
    // subtitle: {
    //     text: 'Source: WorldClimate.com'
    // },
    xAxis: {
      categories: ['Negligible(1)', 'Minor(2)', 'Moderate(3)', 'Major(4)', 'Catastrophic(5)'],
      // tickPositions: [0, 1, 2, 3, 4],
      labels: {
        style: {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontSize: '10px',
          lineHeight: '21px',
          fontWeight: '400',
          color: 'rgba(27, 35, 55, 0.7)'
        }
      },
      min: 0,
      max: 4,
      title: {
        text: 'SEVERITY',
        style: {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontSize: '14px',
          lineHeight: '21px',
          fontWeight: '400',
          color: '#C8B568'
        }
      }
      // crosshair: true
    },
    yAxis: {
      categories: ['Very Unlikely(1)', 'Unlikely(2)', 'Possible(3)', 'Likely(4)', 'Very Likely(5)'],
      tickPositions: [0, 1, 2, 3, 4],
      gridLineWidth: 1, // Set the grid line width to 1 pixel
      gridLineColor: '#E5E5EF',
      labels: {
        style: {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontSize: '10px',
          lineHeight: '21px',
          fontWeight: '400',
          color: 'rgba(27, 35, 55, 0.7)'
        }
      },
      min: 0,
      // tickInterval: 20,
      title: {
        text: 'LIKELYHOOD',
        style: {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontSize: '14px',
          lineHeight: '21px',
          fontWeight: '400',
          color: '#C8B568'
        }
      }
      // tickPositioner: function () {
      //   var positions = [],
      //     tick = Math.floor(this.dataMin),
      //     increment = Math.ceil((this.dataMax - this.dataMin) / 5)
      //   for (tick; tick - increment <= this.dataMax; tick += increment) {
      //     positions.push(tick)
      //   }
      //   return positions
      // }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        groupPadding: 0.1,
        pointWidth: 30,
        borderWidth: 0
      }
    },
    series: heatArray.value
  }
})

const redirectToRiskDept = (event :any, chart :any) => {
  storeSelectedFiltrations()
  const query = {
    col: 'createdAt',
    direction: 'DESC',
    keyword: '',
    pageSize: 10,
    current: 0,
    departments: [] as string[],
    locations: filterState.value.locIds,
  }
  departments.value.forEach((dept :{ id: string, name: string }) => {
    if (event.point?.category === dept.name) query.departments.push(dept.id)
  })
  router.push({ name: RouteNames.RISK_MANAGEMENT, query: query })
}

// Risk By Department chart
const riskDeptChartData = computed(() => {
  return {
    ...riskDeptChartOptions,
    xAxis: {
      categories: barChartDepts.value,
      labels: {
        style: {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontSize: '14px',
          lineHeight: '16px',
          fontWeight: '400',
          color: 'rgba(27, 35, 55, 0.8)'
        },
        title: { text: '' },
      },
      min: 0,
    },
    series: barArray.value || [],
    plotOptions: {
      column: {
        groupPadding: 0.35,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'white',
        events: {
          click: redirectToRiskDept,
        },
      },
    },
  }
})

let actionData = computed(() => {
  return {
    labels: actionPieChart.value.labels,
    datasets: [
      {
        data: actionPieChart.value.values,
        borderWidth: 2,
        hoverOffset: 4,
        borderRadius: 10,
        spacing: 0,
        backgroundColor: actionPieChart.value.colors
      }
    ]
  }
})
const actionOptions = {
  ...actionChartOptions,
  onClick: (event: any, chartData: any) => {
    storeSelectedFiltrations()
    const query = {
      col: 'createdAt',
      direction: 'DESC',
      keyword: '',
      pageSize: 10,
      current: 0,
      departments: filterState.value.depIds,
      locations: filterState.value.locIds,
      status: 'IN_PROGRESS'
    }
    actionData.value.labels.forEach((label :string, index :number) => {
      if (chartData[0].index === index) query.status = ActionStatus[label as keyof typeof ActionStatus]
    })
    router.push({ name: RouteNames.ACTION_MANAGEMENT, query: query })
  },
}


const riskLineData = computed(() => {
  return {
    labels: riskLineRegister.value.labels || [],
    datasets: riskLineRegister.value.data || []
  }
})

const riskOptions = {
  ...lineChartOptions,
  onClick: (event: any, chartData: any) => {
    storeSelectedFiltrations()
    const query :QueryParams= {
      col: 'createdAt',
      direction: 'DESC',
      keyword: '',
      pageSize: 10,
      current: 0,
      departments: filterState.value.depIds,
      locations: filterState.value.locIds,
      status: ''
    }
    if (chartData[0].datasetIndex === 0) delete query?.status
    riskLineRegister.value?.data?.forEach((data :any, index :number) => {
      if (index === 0) return
      if (chartData[0].datasetIndex === index) {
        query.status = data.label.toUpperCase().replace(/\s+/g, "_")
        return
      }
    })
    router.push({ name: RouteNames.RISK_MANAGEMENT, query: query })
  }
}

const legOptions = {
  ...lineChartOptions,
  onClick: () => {
    storeSelectedFiltrations()
    router.push({ name: RouteNames.LEGAL_REGISTER })
  }
}


const legBarData = computed(() => {
  return {
    labels: legisLibChart.value.months || [],
    datasets: legisLibChart.value.data || []
  }
})

const onHeatMapItemClicked = (payload: any) => {
  storeSelectedFiltrations()
  router.push({
    name: RouteNames.RISK_MANAGEMENT,
    query: {
      ires: [payload.rme.rmeId],
      departments: filterState.value.depIds,
      locations: filterState.value.locIds,
      notStatus: [],
      cellValue: payload.cell,
      ic: [payload.sid],
      il: [payload.id1]
    }
  })
  localStorage.setItem('filterRiskMap', JSON.stringify(true))
}

const filteringRiskRegisters = (e :Event) => {
  const target = e.target as HTMLInputElement
  if (riskRecordReport.value?.length > 0 && target?.value) {
    if (!displayRiskLineChart.value) displayRiskLineChart.value = true
    riskLineRegister.value = calculateRiskRegister(riskRecordReport.value, target.value)
    if (riskLineRegister.value.labels.length <= 1) displayRiskLineChart.value = false
  }
  else displayRiskLineChart.value = false
}

const filteringLegalRegisters = (e :Event) => {
  const target = e.target as HTMLInputElement
  if (legalRecordReport.value?.length > 0 && target?.value)
    legisLibChart.value = calculateLegalRegister(legalRecordReport.value, target.value)
  else displayLegisLibChart.value = false
}

const routeToRisk = () => {
  localStorage.setItem('isDueRisk', String(true))
  router.push({ name: RouteNames.RISK_MANAGEMENT })
}
const routeToAction = () => { // for action over threshold card (hidden)
  localStorage.setItem('isDueAction', String(true))
  router.push({ name: RouteNames.ACTION_MANAGEMENT })
}

const cardNavigation = (route :string, status? :string, isThreshold :boolean = false, withUpdates :boolean = false) => {
  storeSelectedFiltrations()
  let routeQuery :QueryParams = {
    col: 'createdAt',
    direction: 'DESC',
    keyword: '',
    pageSize: 10,
    current: 0,
    departments: filterState.value.depIds || [],
    locations: filterState.value.locIds || [],
    status: [],
    dueDateTo: '',
    rskIds: []
  }
  if (status) routeQuery.status = [status] || []
  if (isThreshold) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(currentDate.getDate()).padStart(2, '0');
    routeQuery.dueDateTo = `${year}/${month}/${date}` || ''
  }
  let finalRoute
  if (route === 'risk') {
    if (withUpdates) {
      if (!legislationStatReport.value.risks) legisStore.hasZeroRiskCounts = true
      routeQuery.rskIds = legislationStatReport.value.riskIds
    }
    finalRoute = RouteNames.RISK_MANAGEMENT
  }
  if (route === 'action') finalRoute = RouteNames.ACTION_MANAGEMENT
  if (route === 'issue') finalRoute = RouteNames.ISSUE_MANAGEMENT
  if (route === 'legislation') {  // redirecting to legislation update with status filter
    if (status === 'false') {
      legisStore.legislationUpdateStatus = status
      router.push({ name: RouteNames.LEGISLATION_UPDATES })
      return;
    }
    router.push({ name: RouteNames.LEGISLATION_UPDATES })
    return;
  }
  if (route === 'legal register') {
    if (!legislationStatReport.value.legalRegs) legisStore.hasZeroCounts = true  // if updated legReg count is 0
    legisStore.legRegIdsForUpdates = legislationStatReport.value.legalRegIds   // sending ids for filtration
    router.push({ name: RouteNames.LEGAL_REGISTER })
    return
  }
  router.push({ name: finalRoute, query: routeQuery })
}

const storeSelectedFiltrations = () => {
  localStorage.setItem('filterOptions', JSON.stringify({
    depts: filterState.value.depIds,
    locs: filterState.value.locIds
  }))
}
</script>

<template>
  <ComponentLoading :loading="isLoading" />
  <div v-if="isMissingDeptLoc" class="text-center mt-24">
    <h2 class="font-bold text-xl mb-3">
      Please create at least one {{ `${!me.departments.length && !me.locations.length ? 'Department and Location' : (!me.locations.length ? 'Location' : ( !me.departments.length ? 'Department' : '' ))}` }}
    </h2>
    <AppButton v-if="!me.departments.length" id="createDeptBtn" type="primary" class="mr-3"><router-link :to="{ name: RouteNames.DEPARTMENTS }">Create Department</router-link></AppButton>
    <AppButton v-if="!me.locations.length" id="createLocBtn" type="primary"><router-link :to="{ name: RouteNames.LOCATIONS }">Create Location</router-link></AppButton>
  </div>
  <div v-else>
    <PageHeader title="Organisation Dashboard">
      <FilterDropDown v-model="filterState.depIds" has-search clearable :items="departments" title="Departments" @onChange="initialDashboardCreated = true" />
      <FilterDropDown v-model="filterState.locIds" has-search clearable :items="locations" title="Locations" @onChange="initialDashboardCreated = true" />
    </PageHeader>
    <div class="project-grid">
      <div class="risks-tiles">
        <h2 class="text-xl font-bold mb-3">Risks</h2>
        <div class="left-column">
          <!-- card 1 -->
          <div @click="cardNavigation('risk','', true)">
            <div class="Project-card threshhold">
              <div class="card-text">
                <h2 class="card-heading">Risks Past Due Date</h2>
                <span class="persentage">{{ `${riskStatReport.risksOverThreshold}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 2 -->
          <div @click="cardNavigation('risk','OPEN')">
            <div class="Project-card dues">
              <div class="card-text">
                <h2 class="card-heading">Open Risks</h2>
                <span class="persentage">{{ `${riskStatReport.risksInOpen}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 7 -->
          <div @click="cardNavigation('risk','IN_PROGRESS')">
            <div class="Project-card riskProgress">
              <div class="card-text">
                <h2 class="card-heading">Risks In Progress</h2>
                <span class="persentage">{{ `${riskStatReport.risksInProgress}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 8 -->
          <div @click="cardNavigation('risk','AWAITING_REVIEW')">
            <div class="Project-card actionProgress">
              <div class="card-text">
                <h2 class="card-heading">Risks Awaiting Review</h2>
                <span class="persentage">{{ `${riskStatReport.risksInAwaitingReview}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr>

      <div class="issues-tiles">
        <h2 class="text-xl font-bold mb-3">Issues</h2>
        <div class="left-column">
          <!-- card 5 -->
          <div @click="cardNavigation('issue', '', true)">
            <div class="Project-card threshhold">
              <div class="card-text">
                <h2 class="card-heading">Issues Past Due Date</h2>
                <span class="persentage">{{ `${issueStatReport.issuesOverThresholds}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 6 -->
          <div @click="cardNavigation('issue','OPEN')">
            <div class="Project-card dues">
              <div class="card-text">
                <h2 class="card-heading">Open Issues</h2>
                <span class="persentage">{{ `${issueStatReport.issuesInOpen}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 11 -->
          <div @click="cardNavigation('issue','IN_PROGRESS')">
            <div class="Project-card riskProgress">
              <div class="card-text">
                <h2 class="card-heading">Issues In Progress</h2>
                <span class="persentage">{{ `${issueStatReport.issuesInProgress}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 12 -->
          <div @click="cardNavigation('issue','AWAITING_REVIEW')">
            <div class="Project-card actionProgress">
              <div class="card-text">
                <h2 class="card-heading">Issues Awaiting Review</h2>
                <span class="persentage">{{ `${issueStatReport.issuesInAwaitingReview}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr>

      <div class="action-tiles">
        <h2 class="text-xl font-bold mb-3">Actions</h2>
        <div class="left-column">
          <!-- card 3 -->
          <div @click="cardNavigation('action','OPEN')">
            <div class="Project-card threshhold">
              <div class="card-text">
                <h2 class="card-heading">Open Actions</h2>
                <span class="persentage">{{ `${actionStatReport.actionsInOpen}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 4 -->
          <div @click="cardNavigation('action','IN_REVIEW')">
            <div class="Project-card dues">
              <div class="card-text">
                <h2 class="card-heading">Action In Review</h2>
                <span class="persentage">{{ `${actionStatReport.actionsInReview}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 9 -->
          <div @click="cardNavigation('action','APPROVED')">
            <div class="Project-card riskProgress">
              <div class="card-text">
                <h2 class="card-heading">Approved Actions</h2>
                <span class="persentage">{{ `${actionStatReport.actionsInApproved}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="exclamation-triangle" class="w-9 h-9"/>
              </div>
            </div>
          </div>

          <!-- card 10 -->
          <div @click="cardNavigation('action','REJECTED')">
            <div class="Project-card actionProgress">
              <div class="card-text">
                <h2 class="card-heading">Rejected Actions</h2>
                <span class="persentage">{{ `${actionStatReport.actionsInRejected}` }}</span>
              </div>
              <div class="risk-status">
                <font-awesome-icon icon="flag" class="w-9 h-9"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr>

      <div class="legislation-update-tiles">
        <h2 class="text-xl font-bold mb-3">Legislation Updates</h2>
        <div class="left-column">
          <div @click="cardNavigation('legislation')">
            <div class="Project-card threshhold">
              <div class="card-text">
                <h2 class="card-heading">Updated Legislations</h2>
                <span class="persentage">{{ `${legislationStatReport.updatedActs}` }}</span>
              </div>
              <div class="risk-status">
                <img src="@/assets/imgs/tiles-icons/total_updates.jpg" alt="Update Icon">
              </div>
            </div>
          </div>

          <div @click="cardNavigation('risk', '', false, true)">
            <div class="Project-card dues">
              <div class="card-text">
                <h2 class="card-heading">Risks Updated</h2>
                <span class="persentage">{{ `${legislationStatReport.risks}` }}</span>
              </div>
              <div class="risk-status">
                <img src="@/assets/imgs/tiles-icons/items_updated.png" alt="Update Icon">
              </div>
            </div>
          </div>

          <div @click="cardNavigation('legal register')">
            <div class="Project-card riskProgress">
              <div class="card-text">
                <h2 class="card-heading">Legal Item Updated</h2>
                <span class="persentage">{{ `${legislationStatReport.legalRegs}` }}</span>
              </div>
              <div class="risk-status">
                <img src="@/assets/imgs/tiles-icons/items_updated.png" alt="Update Icon">
              </div>
            </div>
          </div>

          <div @click="cardNavigation('legislation', 'false')">
            <div class="Project-card actionProgress">
              <div class="card-text">
                <h2 class="card-heading">Unread Legislations</h2>
                <span class="persentage">{{ `${legislationStatReport.unread}` }}</span>
              </div>
              <div class="risk-status">
                <img src="@/assets/imgs/tiles-icons/unread.jpg" alt="Update Icon">
              </div>
            </div>
          </div>
        </div>
      </div>


      <!--        <div class="guage-meter">-->
<!--          <h2 class="guage-title">Risk Score</h2>-->
<!--          <div id="chartContainer">-->
<!--            <vue-highcharts-->
<!--                type="chart"-->
<!--                :options="riskChartData"-->
<!--                :redraw-on-update="true"-->
<!--                :one-to-one-update="false"-->
<!--                :animate-on-update="true"-->
<!--            />-->
<!--            <ul class="legends guages-ul">-->
<!--              <li v-for="exposure in exposures" :key="exposure.rmeId" class="legend-list">-->
<!--                <span :id="`${exposure.name}Risk`" class="legend-span"></span>-->
<!--                <span :id="`${exposure.name}RiskLine`" class="legend-button"></span>-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="guage-meter">-->
<!--          <h2 class="guage-title">Management Control Score</h2>-->
<!--          <div id="chartContainerChart">-->
<!--            <vue-highcharts-->
<!--                type="chart"-->
<!--                :options="managementChartData"-->
<!--                :redraw-on-update="true"-->
<!--                :one-to-one-update="false"-->
<!--                :animate-on-update="true"-->
<!--            />-->
<!--            <ul class="legends guages-ul">-->
<!--              <li v-for="exposure in exposures" :key="exposure.rmeId" class="legend-list">-->
<!--                <span :id="`${exposure.name}Ctrl`" class="legend-span"></span>-->
<!--                <span :id="`${exposure.name}CtrlLine`" class="legend-button"></span>-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->
<!--        </div>-->
    </div>

    <div class="grid grid-cols-4 mt-24 items-stretch gap-7">
      <LegislationUpdateContainer
        :updated-legislation-list="legislationStatReport.actDetails"
      />

      <div class="col-span-2">
        <LegislationUpdateBarChart
          :legislation-data="legislationStatReport.actDetails"
        />
      </div>

      <LegislationUpdatePieChart
        :read-updates="legislationStatReport.read"
        :unread-updates="legislationStatReport.unread"
      />
    </div>

    <div v-if="false" class="project-grid register-charts mt-24">
      <div class="bar-chart">
        <div class="chart-header">
          <h2 class="heat-map-heading">Risk Register</h2>
          <select v-model="selectedRiskFilter" class="form-select" aria-label="Default select example" @change="filteringRiskRegisters">
            <option value="0">Monthly</option>
            <option value="1">Yearly</option>
            <option value="2">Weekly</option>
          </select>
        </div>
        <div class="risk-line-chart">
          <Line
              v-if="displayRiskLineChart"
              :data="riskLineData"
              :options="riskOptions"
              style="width: 100%; max-width: 100%;"
          />
          <div v-else class="flex justify-center items-center h-full">
            <h3 class="py-10 xl:py-0">No Risk Line Chart is available</h3>
          </div>
        </div>
      </div>
      <div class="bar-chart">
        <div class="chart-header">
          <h2 class="heat-map-heading">Legal Register</h2>
          <select v-model="selectedLegalFilter" class="form-select" aria-label="Default select example" @change="filteringLegalRegisters">
            <option value="0">Monthly</option>
            <option value="1">Yearly</option>
            <option value="2">Weekly</option>
          </select>
        </div>
        <div class="risk-bar-chart">
          <Line
              v-if="displayLegisLibChart"
              :data="legBarData"
              :options="legOptions"
              style="width: 100%; max-width: 600px"
          />
          <div v-else class="flex justify-center items-center h-full">
            <h3 class="py-10 xl:py-0">No Legislation Chart is available</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="heat-map mt-24" :class="[!riskHeatMap.length ? 'no-chart-found' : '']">
      <h2 class="heat-map-heading">Heat Map</h2>
      <div id="heatChart">
        <div v-if="riskHeatMap.length" class="p-10 flex-1 overflow-x-auto">
          <RiskHeatMap
              :data="riskHeatMap"
              :exposure-levels="exposureLevels"
              :likelihoods="likelihoods"
              :severities="consequences"
              @on-item-clicked="onHeatMapItemClicked($event)"
          />
        </div>
        <div v-else class="flex justify-center items-center h-full">
          <h3>No Heat Map is available</h3>
        </div>
      </div>
    </div>
    <div class="risk-department mt-24">
      <div class="bar-chart">
        <div class="chart-header">
          <h2 class="heat-map-heading">Risk By Department</h2>
        </div>
        <div id="riskChart" class="px-3 flex justify-center">
          <vue-highcharts
              v-if="filterState.depIds.length && barArray.length"
              :key="barChartKey"
              type="chart"
              :options="riskDeptChartData"
              :redraw-on-update="true"
              :one-to-one-update="false"
              :animate-on-update="true"
              class="test"
              style="width: auto !important;"
          />
          <div v-else class="flex justify-center items-center h-full">
            <h3 class="py-10 xl:py-0">No Risk Department Chart is available</h3>
          </div>
        </div>
      </div>
      <div
          v-if="false"
          class="action-management"
          style="
          width: 100%;
          max-width: 344px;
          background-color: white;
          height: 100%;
          box-shadow: 0 4px 20px rgba(13, 10, 44, 0.08);
          border-radius: 6px;
          padding-top: 20px;
        "
      >
        <Doughnut v-if="displayActionChart" :data="actionData" :options="actionOptions" style="cursor: pointer;" />
        <div v-else class="flex justify-center items-center h-full">
          <h3 class="py-10 xl:py-0">No Action Chart is available</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<!--<style>-->
<!--html {-->
<!--  font-size: 62.5%;-->
<!--}-->
<!--</style>-->

<style scoped>
* {
  --risk_over_threshold: #2ba676;
  --risk_over_threshold_opc: #2ba67633;
  --risks_in_progress: #3459ab;
  --risks_in_progress_opc: #3459ab33;
  --actions_past_due_date: #e95380;
  --actions_past_due_date_opc: #aa164333;
  --action_in_progress: #ff8c00;
  --action_in_progress_opc: #ff8c0033;
}

hr{
  border: 1px solid #a87e3a;
  opacity: .6;
}

.project-grid .left-column .Project-card {
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 60px;
  gap: 12px;
  padding: 16px;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}

.project-grid .left-column .Project-card.threshhold,
.project-grid .left-column .Project-card.riskProgress,
.project-grid .left-column .Project-card.dues,
.project-grid .left-column .Project-card.actionProgress {
  cursor: pointer;
}

.dashboard-container .content .legends .legend-list .legend-span{
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: block;
}

.dashboard-container .content .legends .legend-list {
  list-style: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.dashboard-container .content .legends.guages-ul{
  display: flex;
  align-items: center;
  grid-column-gap: 1rem;
  grid-row-gap: .3rem;
  flex-wrap: wrap;
  padding-left: 1.2rem;
  padding-right: 1.2rem;
  padding-bottom: 1rem
}

.project-grid .left-column .Project-card.threshhold {
  border-bottom: 2px solid var(--risk_over_threshold);
}

.project-grid .left-column .Project-card.dues {
  border-bottom: 2px solid var(--actions_past_due_date);
}

.project-grid .left-column .Project-card.riskProgress {
  border-bottom: 2px solid var(--risks_in_progress);
}

.project-grid .left-column .Project-card.actionProgress {
  border-bottom: 2px solid var(--action_in_progress);
}

.project-grid .left-column .Project-card .card-text {
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* justify-content: space-between; */
}

.project-grid .left-column .Project-card .card-text .card-heading {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: #1b2337;
}

.project-grid .left-column .Project-card .card-text .persentage {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-size: 28px;
  line-height: 32px;
}

.project-grid .left-column .Project-card.threshhold .card-text .persentage {
  color: var(--risk_over_threshold);
}

.project-grid .left-column .Project-card.dues .card-text .persentage {
  color: var(--actions_past_due_date);
}

.project-grid .left-column .Project-card.riskProgress .card-text .persentage {
  color: var(--risks_in_progress);
}

.project-grid .left-column .Project-card.actionProgress .card-text .persentage {
  color: var(--action_in_progress);
}

.project-grid .left-column .Project-card .risk-status {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.project-grid .left-column .Project-card.threshhold .risk-status {
  background: var(--risk_over_threshold_opc);
  color: var(--risk_over_threshold);
}

.project-grid .left-column .Project-card.dues .risk-status {
  background: var(--actions_past_due_date_opc);
  color: var(--actions_past_due_date);
}

.project-grid .left-column .Project-card.riskProgress .risk-status {
  background: var(--risks_in_progress_opc);
  color: var(--risks_in_progress);
}

.project-grid .left-column .Project-card.actionProgress .risk-status {
  background: var(--action_in_progress_opc);
  color: var(--action_in_progress);
}

.dashboard-container .content .project-grid .right-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dashboard-container .content .project-grid .right-column .guage-meter {
  height: 100%;
  background: #ffffff;
  box-shadow: 0px 4px 20px rgba(13, 10, 44, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.dashboard-container .content .project-grid .right-column .guage-meter .guage-title {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 24px;
  color: #1b2337;
  padding: 10px;
  border-bottom: 1px solid #e5e5ef;
}


.dashboard-container .content .project-grid .bar-chart,
.dashboard-container .content .risk-department .bar-chart {
  background: #ffffff;
  box-shadow: 0px 4px 20px rgba(13, 10, 44, 0.08);
  border-radius: 6px;
  min-height: 300px;
}

.dashboard-container .content .project-grid .bar-chart .chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #e5e5ef;
}

.dashboard-container .content .project-grid .bar-chart .chart-header .heat-map-heading {
  border-bottom: none;
  padding: 0 !important;
}

.dashboard-container .content .project-grid .bar-chart .chart-header .form-select {
  width: fit-content;
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #615e83;
}

.dashboard-container .content .heat-map {
  position: relative;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(13, 10, 44, 0.08);
  border-radius: 6px;
}

.dashboard-container .content .heat-map::before {
  position: absolute;
  content: '';
  width: 1px;
  height: 75%;
  top: 54%;
  transform: translateY(-50%);
  background-color: #c8b568;
  left: 20px;
  z-index: 10;
}
.dashboard-container .content .no-chart-found{
  height: 400px;
}

.dashboard-container .content .heat-map-heading {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #1b2337;
  border-bottom: 1px solid #e5e5ef;
  padding: 10px;
  margin: 0 !important;
}

.dashboard-container .content .heat-map::after {
  position: absolute;
  content: '';
  width: 90%;
  height: 1px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #c8b568;
  bottom: 20px;
  z-index: 10;
}

.dashboard-container .content .no-chart-found::before,
.dashboard-container .content .no-chart-found::after{
  content: '';
  background-color: transparent;
}
.dashboard-container .content .risk-line-chart canvas,
.dashboard-container .content .risk-bar-chart canvas {
  width: 100% !important;
  max-width: 100% !important;
}

.dashboard-container .content .risk-department #riskChart,
.dashboard-container .content .bar-chart .risk-line-chart,
.dashboard-container .content #heatChart,
.dashboard-container .content .bar-chart .risk-bar-chart{
  height: calc(100% - 45px);
}
.dashboard-container .content .risk-department #riskChart .vue-highcharts .highcharts-container {
  padding: 0 !important;
}

.dashboard-container .content .project-grid .right-column .highcharts-series path {
  fill: #e95353 !important;
}

.dashboard-container .content .risk-department {
  //display: grid;
  //grid-template-columns: 1fr;
  //gap: 20px;
}
.dashboard-container .content .risk-department .bar-chart,
.dashboard-container .content .risk-department .action-management{
  min-height: 390px;
}

@media screen and (max-width: 1200px) {
  .dashboard-container .content .risk-department,
  .dashboard-container .content .project-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .dashboard-container .content .project-grid .left-column {
    grid-template-columns: 1fr;
    row-gap: 1.5rem;
  }

  .dashboard-container {
    grid-template-columns: 1fr;
  }
}

#heatChart {
  width: 100%;
}
</style>
