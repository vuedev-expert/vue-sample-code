<script lang="ts" setup>
import { pageSizes, PaginationInfo, SortDirection, SortInfo } from '@/core/models/table.model'
import { useActionStore } from '@/store/use-action-store'
import { storeToRefs } from 'pinia'
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import ActionEditForm from './components/ActionEditForm.vue'
import { formatDate, hasPermission } from '@/core/helpers/common'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Action, ActionActType, ActionStatus } from '@/core/models/action.model'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import { AppPermission } from '@/core/models/permission.model'
import ActionStatusUpdate from './components/ActionStatusUpdate.vue'
import { useAuthStore } from '@/store/use-auth-store'
import ActionView from './components/ActionView.vue'
import ActionFilter from './components/ActionFilter.vue'
import Pagination from '@/core/components/Pagination.vue'
import ActionSourceDetails from './components/ActionSourceDetails.vue'
import {LocationQueryValue, onBeforeRouteLeave, useRouter} from 'vue-router'
import { QueryParams } from '@/core/models/query-param.model'
import { RouteNames } from '@/core/models/app-router.model'
import { RoleEnum } from '@/core/models/role.model'
import { useToast } from "vue-toastification";
import { actionTableCols, actionTableLabels } from "@/core/constants/table-constants";
import FilterDropDown from '@/core/components/FilterDropDown.vue'
import {FilterDropDownItem} from "@/core/models/common.model";
import { useRiskStore } from "@/store/use-risk-store";

const toast = useToast()
const isActionFormShow = ref(false)
const isViewActionShow = ref(false)
const isConfirmDeleteModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const isViewActionSource = ref(false)
const actionStore = useActionStore()
const actionActType = ref<ActionActType>()
const authStore = useAuthStore()
const riskStore = useRiskStore()
const router = useRouter()

const { userId, userRole, isManager, isUser, actionColFilters } = storeToRefs(authStore)
const { actions, status, total } = storeToRefs(actionStore)

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}

const sort = ref({ ...defaultSort })
let params = {}
const initialParams = ref<QueryParams>()

const selectedAction = ref<Action>()
const currentPage = ref<PaginationInfo>({
  current: 0,
  total: total.value,
  pageSize: 10,
  sibling: 1
})

watch(total, () => {
  currentPage.value.total = total.value
})

onMounted(() => {
  const { col, direction, pageSize, current, ...otherParams } = router.currentRoute.value.query
  sort.value.col = (col as unknown as string) ?? defaultSort.col
  sort.value.direction = (direction as unknown as SortDirection) ?? defaultSort.direction

  try {
    const _pageSize = +(pageSize ?? pageSizes[0])
    if (!pageSizes.includes(_pageSize)) currentPage.value.pageSize = pageSizes[0]
    else currentPage.value.pageSize = _pageSize
  } catch (error) {
    currentPage.value.pageSize = pageSizes[0]
  }

  try {
    currentPage.value.current = +(current ?? 0)
  } catch (error) {
    currentPage.value.current = 0
  }

  if (otherParams) {
    Object.keys(otherParams).forEach((key) => {
      if (key !== 'keyword' && !Array.isArray(otherParams[key])) {
        otherParams[key] = [otherParams[key] as LocationQueryValue]
      }
    })
    initialParams.value = otherParams as QueryParams
  } else {
    initialParams.value = {}
  }
})

onUnmounted(() => { // resetting the store for avoiding saved state
  actionStore.$reset()
  riskStore.$reset()
})

const onClose = (changed?: boolean) => {
  if (changed) doSearch()
  isActionFormShow.value = false
  selectedAction.value = undefined
  isConfirmDeleteModalOpen.value = false
  isConfirmModalOpen.value = false
  isViewActionShow.value = false
  isViewActionSource.value = false
}

const doSearch = () => {
  router.replace({
    name: RouteNames.ACTION_MANAGEMENT,
    query: {
      ...sort.value,
      ...params,
      pageSize: currentPage.value.pageSize,
      current: currentPage.value.current
    }
  })
  actionStore.getActions({
    take: currentPage.value.pageSize,
    skip: currentPage.value.pageSize * currentPage.value.current,
    isReport: !currentPage.value.pageSize ? 'true' : null,
    sortBy: `${sort.value.col}-${sort.value.direction}`,
    ...params
  })
}

const onSort = (event: SortInfo) => {
  if (!event.direction) {
    sort.value = { ...defaultSort }
  } else {
    sort.value = event
  }
  doSearch()
}

const onChangeParams = (p: any) => {
  params = p
  currentPage.value.current = 0
  doSearch()
}

onBeforeRouteLeave(() => {
  if (localStorage.getItem('isDueAction')) localStorage.removeItem('isDueAction')
})

const onChangePage = (pageInfo: { [key: string]: number }) => {
  currentPage.value.current = pageInfo.page
  currentPage.value.pageSize = pageInfo.pageSize
  doSearch()
}

const deleteAction = () => {
  return new Promise((res, rej) => {
    actionStore
      .deleteAction(selectedAction.value!.actId)
      .then(() => {
        res(true)
      })
      .catch(() => rej(false))
  })
}
const openConfirmDeleteModal = (action: Action) => {
  if (isManager.value && action?.assignedUser?.usrId !== userId.value) {
    toast.error('Only the Super Admin can perform this action')
    return
  }
  selectedAction.value = action
  isConfirmDeleteModalOpen.value = true
}
const openConfirmModal = (action: Action, type: ActionActType) => {
  if (isManager.value && action?.assignedUsrId !== userId.value) {
    toast.error('Only the Super Admin can perform this action')
    return
  }
  selectedAction.value = action
  actionActType.value = type
  isConfirmModalOpen.value = true
}

const openActionForm = (action?: Action) => {
  if (action && isManager.value && action?.assignedUser?.usrId !== userId.value) {
    toast.error('Only the Super Admin can perform this action')
    return
  }
  selectedAction.value = action
  isActionFormShow.value = true
}
const openViewAction = (action: Action, viewDetails = false) => {
  selectedAction.value = action
  if (viewDetails) isViewActionSource.value = true
  else isViewActionShow.value = true
}

const isContainsDepartment = (action: any, userId: string) => {
  return action.departments?.some((d: any) => d.userId === userId)
}

const isContainsLocation = (action: any, userId: string) => {
  return action.locations?.some((l: any) => l.userId === userId)
}

const selectedCols = ref<string[]>(actionColFilters.value)
const actionColumnItems = computed<FilterDropDownItem[]>(() => actionTableLabels.map((r) => ({ id: r, name: r })))

const changeColVisibility = (value :string[]) => {
  authStore.toggleColumns({ actionFilter: JSON.stringify(value) })
}
</script>
<template>
  <ConfirmModal
    v-if="isConfirmDeleteModalOpen"
    title="Confirmation"
    type="danger"
    :on-ok="deleteAction"
    @close="onClose"
  >
    <template #body>Do you want to delete this action?</template>
  </ConfirmModal>
  <ActionView v-if="isViewActionShow" :action="selectedAction!" @close="onClose" />
  <ActionSourceDetails v-if="isViewActionSource" :action="selectedAction" @close="onClose" />
  <ActionStatusUpdate
    v-if="isConfirmModalOpen"
    :action="selectedAction!"
    :type="actionActType!"
    @close="onClose"
  />

  <ActionEditForm v-if="isActionFormShow" :action="selectedAction" @close="onClose" />

  <div class="container-xl h-full pb-6 flex flex-col">
    <PageHeader title="Action Management">
      <FilterDropDown
          v-model="selectedCols"
          has-search
          not-sorted
          :items="actionColumnItems"
          title="Filter Columns"
          @on-change="changeColVisibility"
          :width="165"
      />
      <AppButton
        id="addActionBtn"
        v-app-permission="[AppPermission.ACTION_CREATE]"
        icon="circle-plus"
        type="primary"
        @click="openActionForm"
      >
        Add Action
      </AppButton>
    </PageHeader>
    <div class="flex-1 flex flex-col rounded-lg w-full bg-base-white overflow-hidden">
      <ActionFilter
        v-if="initialParams != null"
        :params="initialParams"
        class="px-6 py-8"
        @on-change="onChangeParams"
      />
      <div class="overflow-y-auto flex-1">
        <ComponentLoading :loading="status === 'loading'" />

        <table v-if="actions.length" class="lh-table">
          <thead class="font-bold">
            <tr>
              <template v-for="col in actionTableCols" :key="col.label">
                <th v-if="actionColFilters.includes(col.label) || col.persist" :class="col.class" scope="col">
                  <SortableTableHead
                      :class="col.class"
                      :sort-col="sort"
                      :col="col"
                      @on-sort="onSort"
                  />
                </th>
              </template>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(action, i) in actions" :id="`action-${i}`" :key="action.actId" class="border-b">
              <td class="min-w-[220px] max-w-[320px]">
                <div
                  class="overflow-hidden inline-block max-w-full text-ellipsis hover:underline cursor-pointer"
                  @click="openViewAction(action)"
                >
                  {{ action.description }}
                </div>
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[1].label)" class="min-w-[180px]">
                {{ action.actionSource?.name }}
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[2].label)" class="font-bold">
                <span v-if="action.assignedUsrId">{{ action.assignedUser?.firstName ?? '-' }} {{ action.assignedUser?.lastName ?? '-' }}</span>
                <span v-if="action.assignedTempUsrId">{{ action.assignedTempUser?.firstName ?? '-' }} {{ action.assignedTempUser?.lastName ?? '-' }}</span>
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[3].label)" class="min-w-[120px]">
                <MultipleBadges :items="action.locations" />
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[4].label)" class="min-w-[120px]">
                <MultipleBadges :items="action.departments" />
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[5].label)">
                <div class="italic">{{ formatDate(action?.dueDate) }}</div>
              </td>
              <td v-if="actionColFilters.includes(actionTableCols[6].label)" class="text-center">
                <AppStatus :status="action.status" type="action" />
              </td>
              <td class="!overflow-visible text-center">
                <Menu as="div" class="inline-block">
                  <MenuButton>
                    <font-awesome-icon icon="ellipsis-vertical" class="cursor-pointer px-1" />
                  </MenuButton>
                  <MenuItems
                    class="absolute w-56 divide-y divide-gray-100 bg-base-white overflow-hidden right-[50px] mt-2 py-2 origin-top-right rounded-md shadow-md focus:outline-none z-[1111]"
                  >
                    <div>
                      <MenuItem
                        v-if="
                          (action.status === ActionStatus.OPEN || action.status === ActionStatus.REJECTED) &&
                          (isContainsDepartment(action, userId) ||
                            isContainsLocation(action, userId) ||
                            action.assignedUsrId === userId ||
                            hasPermission([AppPermission.ACTION_SEND_FOR_APPROVAL]))
                        "
                        id="sendApprovalBtn"
                      >
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                          @click="openConfirmModal(action, 'Send')"
                        >
                          <font-awesome-icon icon="paper-plane" class="mr-3" />
                          <span>Send For Approval</span>
                        </button>
                      </MenuItem>
                      <template
                        v-if="
                          action.status === ActionStatus.IN_REVIEW &&
                          (action.risk?.ownId === userId ||
                            isContainsDepartment(action, userId) ||
                            isContainsLocation(action, userId) ||
                            hasPermission([AppPermission.ACTION_FORCE_REVIEW]))
                        "
                      >
                        <MenuItem id="approveBtn">
                          <button
                            class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                            @click="openConfirmModal(action, 'Approve')"
                          >
                            <font-awesome-icon icon="check" class="mr-3" />
                            <span>Approve</span>
                          </button>
                        </MenuItem>
                        <MenuItem id="rejectBtn">
                          <button
                            class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                            @click="openConfirmModal(action, 'Reject')"
                          >
                            <font-awesome-icon icon="times" class="mr-3" />
                            <span>Reject</span>
                          </button>
                        </MenuItem>
                      </template>
                    </div>
                    <div
                      v-if="
                        action.assignedUsrId === userId ||
                        action.risk?.ownId === userId ||
                        action.usrId === userId ||
                        userRole?.name === RoleEnum.SUPER_ADMIN ||
                        userRole?.name === RoleEnum.MANAGER
                      "
                    >
                      <MenuItem id="editActionBtn">
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                          @click="openActionForm(action)"
                        >
                          <font-awesome-icon icon="pen" class="mr-3" />
                          <span>Add Evidence</span>
                        </button>
                      </MenuItem>
                      <MenuItem
                          v-if="['Issue', 'Risk Module'].includes(action?.actionSource.name) && !isUser"
                          id="actionSourceDetailBtn">
                        <button
                            class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 items-center"
                            @click="openViewAction(action, true)"
                        >
                          <font-awesome-icon icon="eye" class="mr-3" />
                          <span>View Details</span>
                        </button>
                      </MenuItem>
                      <MenuItem v-if="hasPermission([AppPermission.ACTION_DELETE])" id="delActionBtn">
                        <button
                          class="w-full px-4 py-3 flex cursor-pointer hover:bg-gray-100 text-red-500 items-center"
                          @click="openConfirmDeleteModal(action)"
                        >
                          <font-awesome-icon icon="trash" class="mr-3" />
                          Delete
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center min-h-[120px] flex items-center justify-center">No Actions Found</div>
      </div>
      <Pagination class="px-6 py-8" :page-info="currentPage" @on-page-change="onChangePage" />
    </div>
  </div>
</template>
