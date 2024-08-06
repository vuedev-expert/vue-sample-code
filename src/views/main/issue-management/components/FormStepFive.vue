<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import ComponentLoading from '@/core/components/ComponentLoading.vue'
import {issueLegalTableCols, issueLegalExportCols} from "@/core/constants/table-constants";
import {SortInfo} from "@/core/models/table.model";
import {useLegalRegisterStore} from "@/store/use-legal-register-store";
import AppToggle from '@/core/components/AppToggle.vue'
import {LegalRegister} from "@/core/models/legislation.model";
import {LegalReport} from "@/core/models/issue-model";
import {exportCSVFile} from "@/core/helpers/csv-export";
import {useToast} from "vue-toastification";

const emits = defineEmits(['getSelectedLegs'])
const props= defineProps<{ legRegIds: string[] }>()

const legalStore = useLegalRegisterStore()
const toast = useToast()

const { legalRegisterItems, status } = storeToRefs(legalStore)

const searchedVal = ref<string>('')
const filteredLegalItems = computed(() => {
  let legalItems = legalRegisterItems.value
  if (searchedVal.value.length) {
    return legalItems.filter((leg) => {
      return leg.orgLegislation?.legislation?.division?.name?.toLowerCase().includes(searchedVal.value.toLowerCase())
    })
  } else return legalItems
})

const selectAllLegals = ref(false)

watch(() => filteredLegalItems.value, () => {
  selectAllLegals.value = props.legRegIds.length === legalRegisterItems.value?.length
})

onMounted(async () => {
  if (!legalRegisterItems.value.length) await doSearch()
  selectAllLegals.value = props.legRegIds.length === legalRegisterItems.value.length
})

const defaultSort: SortInfo = {
  col: 'createdAt',
  direction: 'DESC'
}
const currentSort = ref<SortInfo>({ ...defaultSort })

const doSearch = () => {
  return legalStore.getLegalItems({ isReport: 'true' })
}

const selectedRows = ref<String[]>(props.legRegIds || [])
const toggleSelectAll = () => {
  const filtered = filteredLegalItems.value.map((leg :LegalRegister) => leg.legRegId)
  const allLegRegs = legalRegisterItems.value.map((leg :LegalRegister) => leg.legRegId)
  if (selectAllLegals.value) {
    if (searchedVal.value.length) selectedRows.value = allLegRegs.filter(legID => filtered.includes(legID))
    else selectedRows.value = filtered;
  }
  else {
    if (searchedVal.value.length) selectedRows.value = allLegRegs.filter(legID => !filtered.includes(legID))
    else selectedRows.value = []
  }
}

const isIndeterminate = computed(() => selectedRows.value.length > 0 && selectedRows.value.length < legalRegisterItems.value.length)

const exportLegalItems = () => {
  if (!selectedRows.value.length) {
    toast.error('Please select at least one legal item to export')
    return
  }
  const legalRegs = filteredLegalItems.value
  let exportLegals = legalRegs
      .filter((a) => selectedRows.value.includes(a.legRegId))
      .map((legal) => {
        return {
          division: legal?.orgLegislation?.legislation?.division?.name ?? '--',
          description: legal?.orgLegislation?.legislation?.description ?? '--',
          iso: legal.iso?.name ?? '--',
          locations: legal.locations?.filter((loc :any) => loc)?.map((i) => i.name).join(', ') || '--',
          departments: legal?.departments?.filter((dep :any)=> dep)?.map((i) => i.name).join(', ') || '--',
          compliance: legal?.compliance ? 'YES' : 'NO',
        } as LegalReport
      })
  exportCSVFile(issueLegalExportCols, exportLegals)
}

watch(() => selectedRows.value, (val) => emits('getSelectedLegs', val),
    { deep: true })
</script>

<template>
  <div class="risk-table py-8">
    <h2 class="text-xl">Legal Items</h2>
    <div class="relative my-3 w-3/12">
      <input
          id="searchRisk"
          v-model="searchedVal"
          type="text"
          placeholder="Search the Legal Items"
          class="form-input"
      />
      <font-awesome-icon class="absolute right-2 top-3.5 text-gray-500" icon="search" />
    </div>
    <div v-if="filteredLegalItems.length" class="flex items-center justify-between pb-5">
      <h4>Connect your existing legal items with the issue</h4>
      <AppButton
          v-if="status === 'idle'"
          id="riskFileExport"
          icon="file-export"
          type="primary"
          @click="exportLegalItems">
        Export CSV
      </AppButton>
    </div>
    <div class="overflow-y-auto flex-1 relative" style="max-height: 400px;">
      <ComponentLoading :loading="status === 'loading'" />
      <table v-if="filteredLegalItems.length" class="lh-table">
        <thead class="font-bold bg-gray-100">
        <tr>
          <th v-for="col in issueLegalTableCols" :key="col.label" :class="[col.class]" scope="col">
            <SortableTableHead
                :class="col.class"
                :sort-col="currentSort"
                :col="col"
                @on-sort="() => {}"
            >
              <input
                  v-if="col.allowCB"
                  v-model="selectAllLegals"
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
        <tr
            v-for="(item, i) in filteredLegalItems"
            :key="i"
            class="cursor-pointer hover:bg-gray-50"
        >
          <td class="max-w-[240px]">
            <input
                v-model="selectedRows"
                :value="item.legRegId"
                class="rounded mr-3 border-gray-300 text-primary-500 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-100 focus:ring-opacity-50"
                @change="selectAllLegals = selectedRows.length === legalRegisterItems.length"
                type="checkbox"
            />
            {{ item.orgLegislation?.legislation?.division?.name ?? '--' }}
          </td>
          <td class="min-w-[220px] max-w-[300px]">
            {{ item.orgLegislation?.legislation?.description ?? '--' }}
          </td>
          <td class="min-w-[180px] max-w-[320px]">
            {{ item.iso.name }}
          </td>
          <td class="min-w-[120px]">
            <span v-if="item.locations.length == 0">---</span>
            <span v-else>
                <span
                    v-for="(loc, index) in item.locations?.filter((loc :any) => loc)?.map(({ name }: any) => name).slice(0, 2)"
                    :key="index"
                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-neutral-200 uppercase last:mr-0 mr-1 custom-lable-natural"
                >
                  {{ loc }}
                </span>
              </span>
            <span
                v-if="item.locations.length > 2"
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-emerald-200 uppercase last:mr-0 mr-1 custom-lable-natural"
            >
                + {{ item.locations.length - 2 }}
              </span>
          </td>
          <td class="min-w-[120px]">
            <span v-if="item.departments.length == 0">---</span>
            <span v-else>
                <span
                    v-for="(loc, index) in item.departments?.filter((loc :any) => loc)?.map(({ name }: any) => name).slice(0, 2)"
                    :key="index"
                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-neutral-200 uppercase last:mr-0 mr-1 custom-lable-natural"
                >
                  {{ loc }}
                </span>
              </span>
            <span
                v-if="item.departments.length > 2"
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-neutral-600 bg-emerald-200 uppercase last:mr-0 mr-1 custom-lable-natural"
            >
                + {{ item.departments.length - 2 }}
              </span>
          </td>
          <td class="w-[100px]">
            <AppToggle :value="item.compliance" :disable="true" />
          </td>
        </tr>
        </tbody>
      </table>
      <div v-else class="text-center min-h-[120px] flex items-center justify-center">
        No Legal Register Found
      </div>
    </div>
    <div class="text-right pt-5">
      Total: {{ filteredLegalItems.length }}
    </div>
  </div>
</template>
