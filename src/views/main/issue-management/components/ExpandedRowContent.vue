<template>
  <tr class="align-baseline border-b">
    <td>
      <h3 class="uppercase">Linked Legal Item(s)</h3>
      <div class="table-container">
        <table v-if="props.issueInfo.legalRegisters.length">
          <thead>
            <tr>
              <th>Division</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="legReg in props.issueInfo.legalRegisters" :key="legReg.legRegId">
              <td class="max-w-[80px] border">{{ legReg.orgLegislation?.legislation?.division?.name ?? '--' }}</td>
              <td class="max-w-[120px] border">{{ legReg.orgLegislation?.legislation?.description ?? '--' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center pt-1">No legal items are linked</div>
      </div>
    </td>
    <td>
      <h3 class="uppercase">Linked Action(s)</h3>
      <div class="table-container">
        <table v-if="actions.length">
          <thead>
          <tr>
            <th>Action</th>
            <th>Assignee</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="action in actions" :key="action.actId">
            <td class="max-w-[80px] border">{{ action?.content ?? '--' }}</td>
            <td class="max-w-[120px] border">
              {{ action?.action?.assignedUser?.fullName ??
                `${action.action?.assignedTempUser.firstName} ${action.action?.assignedTempUser.lastName}`
                ?? '--' }}
            </td>
          </tr>
          </tbody>
        </table>
        <div v-else class="text-center pt-1">No mitigations are linked</div>
      </div>
    </td>
    <td>
      <h3 class="uppercase">Linked Risk(s)</h3>
      <div class="table-container">
        <table v-if="props.issueInfo.risks.length">
          <thead>
          <tr>
            <th>Risk Description</th>
            <th>Risk Owner</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="risk in props.issueInfo.risks" :key="risk.rskId">
              <td class="max-w-[80px] border">{{ risk?.description ?? '--' }}</td>
              <td class="max-w-[120px] border">{{ risk?.owner?.fullName ?? '--' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center pt-1">No Risks are linked</div>
      </div>
    </td>
    <td>
      <h3 class="uppercase">Linked Legislation(s)</h3>
      <div class="table-container">
        <table v-if="props.issueInfo.orgLegislations.length">
          <thead>
          <tr>
            <th>Act</th>
            <th>Effective Date</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="leg in props.issueInfo.orgLegislations" :key="leg.orgLegId">
            <td class="max-w-[120px] border">{{ leg.legislation?.act?.name ?? '--' }}</td>
            <td class="w-[80px] border">{{ formatDate(leg.legislation?.act?.effectiveDate) ?? '--' }}</td>
          </tr>
          </tbody>
        </table>
        <div v-else>No legislations are linked</div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import {Issue} from "@/core/models/issue-model"
import {computed} from "vue";
import { formatDate } from '@/core/helpers/common'

const props = defineProps<{ issueInfo: Issue }>()

const actions = computed(() => props.issueInfo.mitigations.filter(action => action.isActionItem))
</script>

<style scoped>
table{
  width: 300px;
}
table th, table td{
  padding: .4rem
}
table td{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/*table{*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*  justify-content: start;*/
/*}*/
.table-container{
  max-height: 150px;
  overflow-y: auto;
  margin: 0 .5rem 1.5rem;
}
h3{ margin: .5rem; font-weight: bolder; }
</style>

