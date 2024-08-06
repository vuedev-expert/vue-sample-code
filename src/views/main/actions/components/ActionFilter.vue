<script lang="ts" setup>
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import { FilterDropDownItem } from '@/core/models/common.model'
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRiskLookups } from '@/core/helpers/risk-service'
import { useAuthStore } from '@/store/use-auth-store'
import { storeToRefs } from 'pinia'
import { useOrgDepartmentStore } from "@/store/use-org-department-store"
import { useOrgLocationStore } from "@/store/use-org-location-store"
import { useUserSetupStore } from '@/store/use-user-setup-store'
import { ActionStatusName } from '@/core/models/action.model'
import { QueryParams } from '@/core/models/query-param.model'
import { debounce } from '@/core/helpers/common'

const emits = defineEmits(['onChange'])
const props = defineProps<{ params: QueryParams }>()

const { actionSources, actionStatuses } = useRiskLookups()
const orgStore = useOrgDepartmentStore()
const locStore = useOrgLocationStore()
const authStore = useAuthStore()

const { departmentDropdown } = storeToRefs(orgStore)
const { locationDropdown } = storeToRefs(locStore)
const userStore = useUserSetupStore()

const { assignees } = storeToRefs(userStore)

const sourceItems = computed<FilterDropDownItem[]>(() =>
  actionSources.value.map((r) => ({ id: r.ascId, name: r.name }))
)
const depItems = computed<FilterDropDownItem[]>(() => departmentDropdown.value)
const locItems = computed<FilterDropDownItem[]>(() => locationDropdown.value)
const statusItems = computed<FilterDropDownItem[]>(() =>
  actionStatuses.map((r) => ({ id: r, name: ActionStatusName[r] }))
)
const userItems = computed<FilterDropDownItem[]>(() =>
  assignees.value.map((r) => ({
      id: r.usrId,
      name: r.usrId === authStore.userId ? 'Current User' : `${r.firstName} ${r.lastName}`
    }))
    .sort((a) => (a.id === authStore.userId ? -1 : 1))
)

const initStateValue = {
  keyword: props.params['keyword'] ?? '',
  assignedUsrIds: props.params['assignedUsrIds'] ?? [],
  sources: props.params['sources'] ?? [],
  departments: props.params['departments'] ?? [],
  locations: props.params['locations'] ?? [],
  status: props.params['status'] ?? []
}

const filterState = reactive<{ [key: string]: any }>({ ...initStateValue })

watch(
  filterState,
  () => {
    emits('onChange', filterState)
  },
  { immediate: true }
)

const setKeyword = debounce((value: string) => {
  if (value.length >= 3) {
    filterState.keyword = value.trim()
  } else if (!value.trim()) {
    filterState.keyword = ''
  }
}, 300)

const onChangeKeyword = (event: any) => {
  const target = event.target as HTMLInputElement
  setKeyword(target.value)
}

const clearFilter = () => {
  filterState.keyword = ''
  filterState.assignedUsrIds = []
  filterState.sources = []
  filterState.departments = []
  filterState.locations = []
  filterState.status = []
  emits('onChange', filterState)
}

const hasValue = computed(() => {
  for (const key in filterState) {
    const val = filterState[key]
    if (val && val.length) return true
  }
  return false
})

const fetchUser = () => {
  userStore.getUserList({}, true)
  userStore.getTempUserList()
  orgStore.getDepartments()
  locStore.getLocations()
}

onMounted(() => {
  fetchUser()
})
onUnmounted(() => {
  userStore.userDropdownList = []
})
</script>
<template>
  <div class="flex flex-wrap gap-2 items-center">
    <div class="relative">
      <input
        id="searchAction"
        type="text"
        placeholder="Search"
        class="form-input pr-8"
        :value="filterState.keyword"
        @input="onChangeKeyword($event)"
      />
      <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
    </div>
    <FilterDropDown v-model="filterState.departments" has-search clearable :items="depItems" title="Departments" />
    <FilterDropDown v-model="filterState.locations" has-search clearable :items="locItems" title="Locations" />
    <FilterDropDown v-model="filterState.assignedUsrIds" has-search clearable :items="userItems" title="Assignees" />
    <FilterDropDown v-model="filterState.sources" has-search clearable not-sorted :items="sourceItems" title="Sources" />
    <FilterDropDown v-model="filterState.status" has-search clearable not-sorted :width="120" single :items="statusItems" title="Status" />
    <AppButton v-if="hasValue" id="clearFilters" icon="times" @click="clearFilter"> Clear</AppButton>
  </div>
</template>
