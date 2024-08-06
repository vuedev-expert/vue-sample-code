<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import {issueSubsLegalExportCols, issueSubsTableCols} from "@/core/constants/table-constants";
import {SortInfo} from "@/core/models/table.model";
import {LegislationSubItem} from "@/core/models/legislation.model";
import LegislationTable from "@/views/main/legislation/components/LegislationTable.vue"
import {useSubscribedItemsStore} from "@/store/use-subscribe-items-store";
import { formatDate } from '@/core/helpers/common'
import {SubLegalReport} from "@/core/models/issue-model";
import {exportCSVFile} from "@/core/helpers/csv-export";
import {useToast} from "vue-toastification";


const emits = defineEmits(['getSelectedSubsLegs'])
const props= defineProps<{ orgLegIds: string[] }>()

const subItemStore = useSubscribedItemsStore()
const toast = useToast()

const { legisItems, status } = storeToRefs(subItemStore)

const selectAllSubLegals = ref(false)
onMounted(async () => {
  if(!legisItems.value.length) await doSearch()
  selectAllSubLegals.value = props.orgLegIds.length === legisItems.value.length
})

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}
const currentSort = ref<SortInfo>({ ...defaultSort })

const doSearch = () => {
  return subItemStore.getSubItems({ isReport: 'true', subscribed: 'true' })
}

const selectedRows = ref<String[]>(props.orgLegIds || [])
const toggleSelectAll = () => {
  if (selectAllSubLegals.value) selectedRows.value = legisItems.value.map((item :LegislationSubItem) => item.orgLegId);
  else selectedRows.value = []
}

const isIndeterminate = computed(() => selectedRows.value.length > 0 && selectedRows.value.length < legisItems.value.length)

const exportSubItems = () => {
  if (!selectedRows.value.length) {
    toast.error('Please select at least one legislation to export')
    return
  }
  const subsItems = legisItems.value
  let exportSubItems = subsItems
      .filter((a) => selectedRows.value.includes(a.orgLegId))
      .map((a) => {
        return {
          act: a?.legislation?.act?.name ?? '--',
          effectiveDate: formatDate(a?.legislation?.act?.effectiveDate) ?? '',
          division: a?.legislation?.division?.name ?? '--',
          description: a?.legislation?.description ?? '--',
        } as SubLegalReport
      })
  exportCSVFile(issueSubsLegalExportCols, exportSubItems)
}

watch(() => selectedRows.value, (val) => emits('getSelectedSubsLegs', val),
    { deep: true })
</script>

<template>
  <div class="other-legislations-tables py-8">
    <h4 class="text-primary-500 font-bold text-xl pb-5">Subscribe to new legislations and connect it with the issue</h4>
    <LegislationTable @on-add-success="(val :Boolean) => val ? doSearch() : null" />

    <div v-if="legisItems.length" class="flex items-center justify-between pb-5">
      <h4 class="text-primary-500 font-bold text-xl">Subscribed Legal Items</h4>
      <AppButton
          v-if="status === 'idle'"
          id="riskFileExport"
          icon="file-export"
          type="primary"
          @click="exportSubItems">
        Export CSV
      </AppButton>
    </div>
    <div class="overflow-y-auto flex-1 relative z-0" style="max-height: 400px;">
      <ComponentLoading :loading="status === 'loading'" />
      <table v-if="legisItems.length" class="lh-table">
        <thead class="font-bold bg-gray-100">
        <tr>
          <th v-for="col in issueSubsTableCols" :key="col.label" scope="col">
            <SortableTableHead
                :class="col.class"
                :sort-col="currentSort"
                :col="col"
                @on-sort="() => {}"
            >
              <input
                  v-if="col.allowCB"
                  v-model="selectAllSubLegals"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                  type="checkbox"
                  class="rounded mr-3 border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
              />
            </SortableTableHead>
          </th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="item in legisItems"
            :key="item.orgLegId"
            class="bg-white border-b"
        >
          <td class="min-w-[220px] max-w-[300px]">
            <input
                v-model="selectedRows"
                :value="item.orgLegId"
                class="rounded mr-3 border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
                @change="selectAllSubLegals = selectedRows.length === legisItems.length"
                type="checkbox"
            />
            {{ item?.legislation?.act?.name ?? '--' }}
          </td>
          <td class="w-[100px] italic">
            {{ formatDate(item?.legislation?.act?.effectiveDate) ?? '--' }}
          </td>
          <td class="min-w-[180px] max-w-[320px]">
            {{ item?.legislation?.division?.name ?? '--' }}
          </td>
          <td class="min-w-[220px] max-w-[320px]">
            {{ item?.legislation?.description ?? '--' }}
          </td>
        </tr>
        </tbody>
      </table>
      <div v-else class="text-center min-h-[120px] flex items-center justify-center">
        No subscribed items found
      </div>
    </div>
    <div class="text-right pt-5">
      Total: {{ legisItems.length }}
    </div>
  </div>
</template>

<style>
.other-legislations-tables .leg-filters{
  padding: 0 !important;
}
</style>
