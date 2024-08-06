<script lang="ts" setup>
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import {FilterDropDownItem} from '@/core/models/common.model'
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {formatDate, getUserName} from '@/core/helpers/common'
import {useReportStore} from '@/store/use-report-store'
import {storeToRefs} from 'pinia'
import {useRiskMatrixStore} from '@/store/use-risk-matrix.store'
import {Risk, RiskReport, RiskStatus, RiskStatusText} from '@/core/models/risk.model'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import {exportCSVFile} from '@/core/helpers/csv-export'
import {ActionReport, ActionStatus, ActionStatusName} from '@/core/models/action.model'
import { Issue, IssueReport, IssueStatusText, issueTypes } from "@/core/models/issue-model";
import {useAuthStore} from '@/store/use-auth-store'
import {QueryParams} from '@/core/models/query-param.model'
import AppToggle from '@/core/components/AppToggle.vue'
import {RoleEnum} from '@/core/models/role.model'
import {useRiskLookups} from '@/core/helpers/risk-service'
import {
  riskColumns,
  actionColumns,
  exportActionCols,
  legalColumns,
  issueColumns,
  exportIssueColumns
} from "@/core/constants/report-constants";
import ExpandedRowContent from "@/views/main/issue-management/components/ExpandedRowContent.vue"
import RiskAnalysisFields from "@/views/main/issue-management/components/RiskAnalysisFields.vue";
import moment from 'moment'

interface FilterState {
  types?: string[] | number[]
  status?: string[]
  dueDateTo?: string
  issueType?: string[]
  dateRange: string[]
  departments: string[]
  locations: string[]
}

const { isoStandards } = useRiskLookups()
const reportStore = useReportStore()
const riskMatrixStore = useRiskMatrixStore()
const { exposureLevels } = storeToRefs(riskMatrixStore)
const authStore = useAuthStore()

const { userDepartments, userLocations, userRole } = storeToRefs(authStore)
const { risks, status, actionTotal, riskTotal, actions, legalRegisters, legalRegisterTotal, issues, issueTotal, countsKey } = storeToRefs(reportStore)

const hasSearch = ref(false)
const responseFetched = ref(false)

onMounted(() => {
  if (exposureLevels.value.length === 0) riskMatrixStore.getRiskMatrixExposureLevels()
})

const getBeforeRme = (risk: Risk) => {
  if (risk.beforeRml && risk.beforeRms) {
    const value = risk.beforeRml.value * risk.beforeRms.value
    const rme = exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value)
    return {
      value,
      name: rme?.name,
      color: rme?.color
    }
  }
}

const getAfterRme = (risk: Risk) => {
  if (risk.afterRml && risk.afterRms) {
    const value = risk.afterRml.value * risk.afterRms.value
    const rme = exposureLevels.value.find((it) => it.fromValue <= value && it.toValue >= value)
    return {
      value,
      name: rme?.name,
      color: rme?.color
    }
  }
}

const adjustedRisks = computed(() => {
  return risks.value.map((it) => ({
    ...it,
    username: getUserName(it.owner),
    beforeRme: getBeforeRme(it),
    afterRme: getAfterRme(it),
    formattedCreatedAt: formatDate(it.createdAt),
    formattedDueDate: formatDate(it.dueDate)
  }))
})

const exportModules: FilterDropDownItem[] = [
  { name: 'Risk Register', id: 'risks', hidden: userRole.value?.name === RoleEnum.USER },
  { name: 'Action Center', id: 'actions' },
  { name: 'Legal Register', id: 'legalRegisters' },
  { name: 'Issue Management', id: 'issues' },
]

const maxExposureValue = computed(() => {
  if (exposureLevels.value.length === 0) {
    return 1
  } else {
    return Math.max(...exposureLevels.value.map((it) => it.toValue))
  }
})

const module = ref([])

const risksFilterState = ref({
  status: [],
  dueDateTo: '',
  dateRange: [],
  departments: [],
  locations: []
})
const actionsFilterState = ref({
  status: [],
  dateRange: [],
  departments: [],
  locations: []
})

const legalRegistersFilterState = ref({
  types: [],
  dateRange: [],
  departments: [],
  locations: []
})

const issuesFilterState = ref({
  issueType: [],
  departments: [],
  locations: [],
  dateRange: [],
})


const exportCsv = async () => {
  if (!module.value.length) return

  if (module.value[0] === 'risks') {
    let exportRisks = adjustedRisks.value.map((a) => {
      return {
        risk: a.description,
        source: a.riskSource?.name ?? '--',
        owner: getUserName(a?.owner) ?? '--',
        location: a.locations?.filter((loc :any)=> loc).map((i) => i.name).join(', ') || '--',
        department: a.departments?.filter((dep :any)=> dep).map((i) => i.name).join(', ') || '--',
        riskHazard: a.riskHazard?.hazardType?.name ?? '--',
        il: a.beforeRml?.value ?? 0,
        ic: a.beforeRms?.value ?? 0,
        ire: a.beforeRme?.value ?? 0,
        rl: a.afterRml?.value ?? 0,
        rc: a.afterRms?.value ?? 0,
        rre: a.afterRme?.value ?? 0,
        createdAt: formatDate(a.createdAt) ?? '--',
        dueDate: a.formattedDueDate ?? '--',
        status: RiskStatusText[a.status] ?? '--'
      } as RiskReport
    })
    exportCSVFile(riskColumns, exportRisks)
  } else if (module.value[0] === 'actions') {
    let exportActions = actions.value.map(
      (a) =>
        ({
          action: a?.description || '--',
          source: a?.actionSource?.name || '--',
          assignee: getUserName(a?.assignedUser) || '--',
          locations: a.locations?.filter((loc :any) => loc).map((i) => i.name).join(' , ') || '--',
          departments: a?.departments?.filter((dep :any)=> dep).map((i) => i.name).join(' , ') || '--',
          createdAt: formatDate(a.createdAt) || '--',
          dueDate: formatDate(a?.dueDate) || '--',
          forecastDate: formatDate(a?.forecastDate) || '--',
          status: ActionStatusName[a.status]
        } as ActionReport)
    )
    exportCSVFile(exportActionCols, exportActions)
  } else if  (module.value[0] === 'legalRegisters') {
    let exportLegals = legalRegisters.value.map((legal) => ({
      division: legal?.orgLegislation?.legislation?.division?.name ?? '--',
      description: legal?.orgLegislation?.legislation?.description ?? '--',
      iso: legal.iso?.name ?? '--',
      locations: legal.locations?.filter((loc :any) => loc).map((i) => i.name).join(', ') || '--',
      departments: legal?.departments?.filter((dep :any)=> dep).map((i) => i.name).join(', ') || '--',
      compliance: legal?.compliance ? 'YES' : 'NO',
      createdAt: formatDate(legal?.createdAt ?? '--') ?? '--',
    }))
    exportCSVFile(legalColumns, exportLegals)
  } else if  (module.value[0] === 'issues') {
    let exportIssues = issues.value.map((issue :Issue) => {
      let whyString = ''
      issue.whys?.forEach((val, i) => {
        whyString += `${ val.question ? 'Q'+(i+1)+': '+ val.question + '\n':''}${ val.answer ? 'A'+(i+1)+': ' + val.answer + '\n\n':'' }`
      })
      return ({
        issue: issue.description ?? '--',
        issueType: issue.issueType ?? '--',
        iso: issue.iso.name ?? '--',
        owner: issue.owner.fullName || '--',
        location: issue.location?.name || '--',
        departments: issue.departments?.filter((dep :any)=> dep)?.map((i) => i.name).join(', ') || '--',
        priorityType: issue.priorityType ? issue.priorityType?.charAt(0).toUpperCase() + issue?.priorityType?.slice(1).toLowerCase() : '--',
        peopleAtRisk: issue?.numPersonsAtRisk ?? '--',
        whys: whyString.length ? whyString : '--',
        createdAt: formatDate(issue?.createdAt) ?? '--',
        dueDate: formatDate(issue.dueDate) ?? '--',
        status: IssueStatusText[issue.status] ?? '--'
        } as IssueReport)})
    exportCSVFile(exportIssueColumns, exportIssues, true)
  }
}
watch(() => module.value, (newVal, oldVal) => {
  if (!oldVal.includes(newVal[0]) && newVal.length) {
    const filterStateRef = eval(`${newVal[0]}FilterState`)
    reportStore.$reset()
    filterStateRef.value = {
      types: [],
      dateRange: [],
      departments: [],
      locations: [],
      issueType: []
    }
  }
})

const riskTypes = [
  {
    name: 'Risks overdue',
    id: moment().format('YYYY/MM/DD'),
    query: {
      status: [RiskStatus.OPEN, RiskStatus.IN_PROGRESS],
      dueDateTo: moment().format('YYYY/MM/DD')
    }
  },
  {
    name: 'Risks in progress',
    id: RiskStatus.IN_PROGRESS,
    query: {
      status: [RiskStatus.OPEN, RiskStatus.IN_PROGRESS]
    }
  },
  {
    name: 'Closed Risks',
    id: RiskStatus.CLOSED,
    query: {
      status: [RiskStatus.CLOSED]
    }
  },
  {
    name: 'Open Risks',
    id: RiskStatus.OPEN,
    query: {
      status: [RiskStatus.OPEN]
    }
  }
]

const riskTypeItems = computed(() => {
  return riskTypes.map((item) => {
    return { id: item.id, name: item.name }
  })
})
const actionTypes = [
  {
    name: 'Closed Actions',
    id: ActionStatus.APPROVED,
    query: {
      status: [ActionStatus.APPROVED]
    }
  },
  {
    name: 'Actions in progress',
    id: ActionStatus.IN_REVIEW,
    query: {
      status: [ActionStatus.IN_REVIEW, ActionStatus.REJECTED, ActionStatus.OPEN]
    }
  }
]
const actionsTypeItems = computed(() => {
  return actionTypes.map((item) => {
    return { id: item.id, name: item.name }
  })
})

const issueTypeItems = computed(() => issueTypes.map((type) => ({id: type.text, name: type.text})))

const isoStandardsItems = computed(() => isoStandards.value.map((r) => ({ id: r.isoId, name: r.name })))

const depItems = computed<FilterDropDownItem[]>(() => userDepartments.value.map((r) => ({ id: r.depId, name: r.name })))
const locItems = computed<FilterDropDownItem[]>(() => userLocations.value.map((r) => ({ id: r.locId, name: r.name })))

const applySearch = async () => {
  if (!module.value.length) return
  hasSearch.value = true
  responseFetched.value = true
  if (module.value[0] === 'risks') {
    await reportStore.fetchRisks(getSearchQuery(risksFilterState.value))
  } else if (module.value[0] === 'actions') {
    await reportStore.getActions(getSearchQuery(actionsFilterState.value))
  } else if (module.value[0] === 'legalRegisters') {
    await reportStore.getLegalRegisters(getSearchQuery(legalRegistersFilterState.value))
  } else if (module.value[0] === 'issues') {
    await reportStore.getIssues(getSearchQuery(issuesFilterState.value))
  }
  hasSearch.value = false
}

const getSearchQuery = (value: FilterState) => {
  let query = { ...value } as QueryParams
  const { dateRange, types, status } = value
  delete query.dateRange
  delete query.types
  if (dateRange && dateRange.length)
    query = {
      ...query,
      createdAtFrom: moment(dateRange[0]).format('YYYY/MM/DD'),
      createdAtTo: moment(dateRange[1]).format('YYYY/MM/DD'),
    }
  if (types?.length) {
    query = { ...query, ...({ iso: types[0] as number } as QueryParams) }
  }
  if (module.value[0] === 'risks' && status?.length) {
    const statuses = Object.keys(RiskStatusText)
    if (!statuses?.includes(status[0])) {
      query.dueDateTo = status
      delete query.status
    }
  }
  query.isReport = 'true'
  return query
}

onUnmounted(() => reportStore.$reset())

const clearFilter = () => {
  responseFetched.value = false
  module.value = []
  risksFilterState.value = {
    status: [],
    dueDateTo: '',
    dateRange: [],
    departments: [],
    locations: []
  }
  actionsFilterState.value = {
    status: [],
    dateRange: [],
    departments: [],
    locations: []
  }
  legalRegistersFilterState.value = {
    types: [],
    dateRange: [],
    departments: [],
    locations: []
  }
}

const updatingFilter = (e: number[]) => {
  if (!e?.length && (actionTotal.value || riskTotal.value || issueTotal.value || legalRegisterTotal.value)) applySearch()
}

watch(countsKey, () => {
  if (responseFetched.value) applySearch()
})

const collapsedRows = ref<number[]>([]);
const toggleCollapse = (index :number) => {
  if (collapsedRows.value.includes(index)) collapsedRows.value = collapsedRows.value.filter((item :number) => item !== index);
  else collapsedRows.value.push(index);
}

const selectedWhys = ref<{ question: string, answer: string }[]>([])
const showWhys = ref(false)

const viewWhys = (issue :Issue) => {
  selectedWhys.value = issue?.whys
  showWhys.value = true
}
</script>
<template>
  <div class="container-xl h-full pb-6 flex flex-col">
    <PageHeader title="Report"> </PageHeader>
    <div class="flex-1 flex flex-col rounded-lg w-full bg-base-white overflow-hidden">
      <div class="flex flex-wrap gap-2 z-10 px-6 py-6 items-center">
        <FilterDropDown v-model="module" :items="exportModules" title="Select Export Module" single />
        <template v-if="module.length && module[0] === 'risks'">
          <FilterDropDown
            v-model="risksFilterState.status"
            :items="riskTypeItems"
            clearable
            has-search
            not-sorted
            :width="160"
            title="Select Risk type"
            single
            @onChange="updatingFilter"
          />
          <FilterDropDown
            v-model="risksFilterState.departments"
            :disabled="!module.length"
            clearable
            has-search
            :items="depItems"
            title="Departments"
            @onChange="updatingFilter"
          />
          <FilterDropDown
            v-if="module.length"
            v-model="risksFilterState.locations"
            clearable
            has-search
            :items="locItems"
            title="Locations"
            @onChange="updatingFilter"
          />

          <Datepicker
            v-if="module.length"
            v-model="risksFilterState.dateRange"
            :format="formatDate"
            style="min-width: 260px"
            preview-format="dd/MM/yyyy"
            placeholder="Select creation range"
            range
            @update:model-value="updatingFilter"
          />
        </template>
        <template v-if="module.length && module[0] === 'actions'">
          <FilterDropDown
            v-model="actionsFilterState.status"
            :items="actionsTypeItems"
            clearable
            has-search
            :width="160"
            title="Select action type"
            single
            @onChange="updatingFilter"
          />
          <FilterDropDown v-model="actionsFilterState.departments" has-search clearable :items="depItems" title="Departments" @onChange="updatingFilter" />
          <FilterDropDown v-model="actionsFilterState.locations" has-search clearable :items="locItems" title="Locations" @onChange="updatingFilter" />

          <Datepicker
            v-model="actionsFilterState.dateRange"
            :format="formatDate"
            style="min-width: 260px"
            preview-format="dd/MM/yyyy"
            placeholder="Select creation range"
            range
            @update:model-value="updatingFilter"
          />
        </template>
        <template v-if="module.length && module[0] === 'legalRegisters'">
          <FilterDropDown
            v-model="legalRegistersFilterState.types"
            :items="isoStandardsItems"
            clearable
            has-search
            title="ISO Standards"
            single
            @onChange="updatingFilter"
          />
          <FilterDropDown v-model="legalRegistersFilterState.departments" has-search clearable :items="depItems" title="Departments" @onChange="updatingFilter" />
          <FilterDropDown v-model="legalRegistersFilterState.locations" has-search clearable :items="locItems" title="Locations" @onChange="updatingFilter" />

          <Datepicker
            v-model="legalRegistersFilterState.dateRange"
            :format="formatDate"
            style="min-width: 260px"
            preview-format="dd/MM/yyyy"
            placeholder="Select creation range"
            range
            @update:model-value="updatingFilter"
          />
        </template>
        <template v-if="module.length && module[0] === 'issues'">
          <FilterDropDown
              v-model="issuesFilterState.issueType"
              :items="issueTypeItems"
              clearable
              not-sorted
              has-search
              title="Select Issue Type"
              @onChange="updatingFilter"
          />
          <FilterDropDown v-model="issuesFilterState.departments" has-search clearable :items="depItems" title="Departments" @onChange="updatingFilter" />
          <FilterDropDown v-model="issuesFilterState.locations" has-search clearable :items="locItems" title="Locations" @onChange="updatingFilter" />

          <Datepicker
              v-model="issuesFilterState.dateRange"
              :format="formatDate"
              style="min-width: 260px"
              preview-format="dd/MM/yyyy"
              placeholder="Select creation range"
              range
              @update:model-value="updatingFilter"
          />
        </template>
        <AppButton v-if="module.length" icon="circle-plus" class="mr-2" type="dark" @click="applySearch">
          Create Report
        </AppButton>
        <AppButton v-if="module.length" type="light" @click="() => clearFilter()">Clear</AppButton>
      </div>
      <div
          class="overflow-y-auto flex-1 relative z-0 report-export"
          :class="[actionTotal || riskTotal || legalRegisterTotal || issueTotal? 'max-h-96':'h-full']">
        <ComponentLoading :loading="status === 'loading'" />

        <template v-if="module.length && module[0] === 'risks'">
          <table v-if="adjustedRisks.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
              <tr>
                <th v-for="(col, index) in riskColumns" :key="index" scope="col">
                  {{ col }}
                </th>
                <th scope="col" class="px-2 py-6"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="risk in adjustedRisks" :key="risk.rskId" class="bg-white border-b">
                <td class="min-w-[220px] max-w-[320px]">
                  {{ risk.description }}
                </td>
                <td class="min-w-[180px]">{{ risk.riskSource?.name ?? '-' }}</td>
                <td class="font-bold">
                  {{ risk?.owner.fullName }}
                </td>
                <td>
                  <MultipleBadges :items="risk.locations" />
                </td>
                <td>
                  <MultipleBadges :items="risk.departments" />
                </td>
                <td
                    v-if="risk?.riskHazard?.hazardTypeId"
                    class="min-w-[30px] max-w-[150px]"
                >
                  {{ risk.riskHazard?.hazardType?.name }}
                </td>
                <td v-else>---</td>
                <td>{{ risk.beforeRml?.value ?? '-' }}</td>
                <td>{{ risk.beforeRms?.value ?? '-' }}</td>
                <td>
                  <RiskExposure
                    v-if="risk.beforeRme?.value"
                    :color="risk.beforeRme?.color ?? '#FFFFFF'"
                    :name="risk.beforeRme?.name ?? ''"
                    :value="risk.beforeRme?.value"
                    :max-value="maxExposureValue"
                  >
                  </RiskExposure>
                </td>
                <td>{{ risk.afterRml?.value ?? '-' }}</td>
                <td>{{ risk.afterRms?.value ?? '-' }}</td>
                <td>
                  <RiskExposure
                    v-if="risk.afterRme?.value"
                    :color="risk.afterRme?.color ?? '#FFFFFF'"
                    :name="risk.afterRme?.name ?? ''"
                    :value="risk.afterRme?.value"
                    :max-value="maxExposureValue"
                  >
                  </RiskExposure>
                </td>
                <td class="italic">{{ formatDate(risk.createdAt) }}</td>
                <td class="italic">{{ risk.formattedDueDate || '-' }}</td>
                <td class="text-center">
                  <AppStatus :status="risk.status" type="risk" />
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!hasSearch && !risks.length" class="text-center min-h-[120px] flex items-center justify-center">
            No risk found!
          </div>
        </template>
        <template v-if="module.length && module[0] === 'actions'">
          <table v-if="actions.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
              <tr>
                <th v-for="(col, index) in actionColumns" :key="index" scope="col">
                  {{ col }}
                </th>
                <th scope="col" class="px-2 py-6"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="action in actions" :key="action.actId" class="bg-white border-b">
                <td class="min-w-[220px] max-w-[320px]">
                  {{ action.description }}
                </td>
                <td class="min-w-[180px]">{{ action.actionSource?.name ?? '-' }}</td>
                <td class="font-bold">
                  {{ getUserName(action.assignedUser) }}
                </td>
                <td>
                  <MultipleBadges :items="action.locations" />
                </td>
                <td>
                  <MultipleBadges :items="action.departments" />
                </td>
                <td class="italic">{{ formatDate(action.createdAt) }}</td>
                <td class="italic">{{ formatDate(action.dueDate) }}</td>
                <td class="text-center">
                  <AppStatus :status="action.status" type="action" />
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!hasSearch && !actions.length" class="text-center min-h-[120px] flex items-center justify-center">
            No actions found!
          </div>
        </template>
        <template v-if="module.length && module[0] === 'legalRegisters'">
          <table v-if="legalRegisters.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
              <tr>
                <th v-for="(col, index) in legalColumns" :key="index" scope="col">
                  {{ col }}
                </th>
                <th scope="col" class="px-2 py-6"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="legal in legalRegisters" :key="legal.legRegId" class="bg-white border-b">
                <td class="min-w-[220px] max-w-[320px]">
                  {{ legal?.orgLegislation?.legislation?.division?.name ?? '--' }}
                </td>
                <td class="min-w-[220px] max-w-[320px]">
                  {{ legal.orgLegislation?.legislation?.description ?? '--' }}
                </td>
                <td class="font-bold">
                  {{ legal.iso?.name }}
                </td>
                <td>
                  <MultipleBadges :items="legal.locations" />
                </td>
                <td>
                  <MultipleBadges :items="legal.departments" />
                </td>
                <td class="w-[100px]">
                  <AppToggle :disable="true" :value="legal.compliance" />
                </td>
                <td class="italic">{{ formatDate(legal.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="!hasSearch && !legalRegisters.length"
            class="text-center min-h-[120px] flex items-center justify-center"
          >
            No Legal Registers found!
          </div>
        </template>
        <template v-if="module.length && module[0] === 'issues'">
          <table v-if="issues.length" class="lh-table">
            <thead class="font-bold bg-gray-100">
            <tr>
              <th v-for="(col, index) in issueColumns" :key="index" :class="{'text-center':['Whys','Status'].includes(col)}" scope="col">
                {{ col }}
              </th>
              <th scope="col" class="px-2 py-6"></th>
            </tr>
            </thead>

            <tbody>
              <template
                  v-for="(issue, i) in issues"
                  :key="issue.issueId"
              >
                <tr
                    class="bg-white"
                    :class="{'border-b': !collapsedRows.includes(i), 'shadow-lg pb-3': collapsedRows.includes(i)}"
                >
                  <td class="min-w-[220px] max-w-[320px]">
                    <font-awesome-icon @click="toggleCollapse(i)" icon="plus-circle" class="cursor-pointer mr-2" />
                    {{ issue?.description ?? '--' }}
                  </td>
                  <td class="min-w-[130px]">{{ issue.issueType ?? '--' }}</td>
                  <td class="min-w-[150px] max-w-[250px]">
                    {{ issue?.iso?.name }}
                  </td>
                  <td>{{ issue.owner?.fullName ?? '--' }}</td>
                  <td>{{ issue.location.name }}</td>
                  <td>
                    <MultipleBadges :items="issue.departments" />
                  </td>
                  <td>
                    {{ issue?.priorityType?.charAt(0).toUpperCase() + issue?.priorityType?.slice(1).toLowerCase() ?? '--' }}
                  </td>
                  <td><span class="cursor-pointer text-primary-500 hover:text-primary-700" @click="viewWhys(issue)">
                    View Whys
                  </span></td>
                  <td class="italic">{{ formatDate(issue.createdAt) }}</td>
                  <td class="italic">{{ formatDate(issue.dueDate) }}</td>
                  <td class="text-center">
                    <AppStatus :status="issue.status" type="issue" />
                  </td>
                </tr>
                <template v-if="collapsedRows.includes(i)">
                  <ExpandedRowContent :issue-info="issue" />
                </template>
              </template>
            </tbody>
          </table>
          <div
              v-if="!hasSearch && !issues.length"
              class="text-center min-h-[120px] flex items-center justify-center"
          >No Issues found!</div>
        </template>

        <div v-if="!module.length" class="text-center min-h-[120px] flex items-center justify-center">
          Select module to export!
        </div>
      </div>
      <div v-if="module.length" class="py-6 px-6 space-x-4 text-right">
        <span v-if="module[0] === 'actions'" class="text-gray-600 !ml-auto inline-block">
          Total: {{ actionTotal }}
        </span>
        <span v-else-if="module[0] === 'risks'" class="text-gray-600 !ml-auto inline-block">
          Total: {{ riskTotal }}
        </span>
        <span v-else-if="module[0] === 'legalRegisters'" class="text-gray-600 !ml-auto inline-block">
          Total: {{ legalRegisterTotal }}
        </span>
        <span v-else-if="module[0] === 'issues'" class="text-gray-600 !ml-auto inline-block">
          Total: {{ issueTotal }}
        </span>

        <AppButton
          v-if="
            (module[0] === 'actions' && actions.length) ||
            (module[0] === 'risks' && risks.length) ||
            (module[0] === 'legalRegisters' && legalRegisters.length) ||
            (module[0] === 'issues' && issueTotal)
          "
          icon="file-export"
          class="mr-2"
          type="primary"
          @click="exportCsv"
        >
          Export CSV
        </AppButton>
      </div>
    </div>
  </div>

  <AppModal
      v-if="showWhys"
      title="Risk Analysis"
      ok-text="Ok"
      :can-dismiss="true"
      :center-content="!selectedWhys?.length"
      @close="showWhys = false"
  >
    <template #body>
      <div v-if="selectedWhys?.length">
        <RiskAnalysisFields
            v-for="(field, i) in selectedWhys"
            :key="i"
            :analysis-fields="field"
            :disabled="true"
        />
      </div>
      <h3 v-else class="flex justify-center items-center text-xl flex-1">
        No risk analysis data found
      </h3>
    </template>
  </AppModal>
</template>
