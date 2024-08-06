<script lang="ts" setup>
import { Action } from '@/core/models/action.model'
import { formatDate } from '@/core/helpers/common'
import AttachmentUpload from './AttachmentUpload.vue'
import { useActionStore } from '@/store/use-action-store'
import { computed, onMounted, onUnmounted } from 'vue'
import {storeToRefs} from "pinia";
import { useOrgLocationStore } from "@/store/use-org-location-store";
import { useOrgDepartmentStore } from "@/store/use-org-department-store";

const props = defineProps<{ action: Action }>()

const emits = defineEmits(['close'])

const actionStore = useActionStore()
const locationsStore = useOrgLocationStore()
const departmentsStore = useOrgDepartmentStore()

const { locations } = storeToRefs(locationsStore)
const { departments } = storeToRefs(departmentsStore)

const selectedDepts =computed(() => props.action.departments.map(dept => dept.depId))
const selectedLocs =computed(() => props.action.locations.map(loc => loc.locId))

onMounted(() => {
  actionStore.attachments = props.action.attachments
})
onUnmounted(() => {
  actionStore.attachments = []
})
</script>
<template>
  <AppModal :has-footer="false" title="Action Detail" @close="(value:any) => emits('close', value)">
    <template #body>
      <div>
        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea
            readonly
            class="form-input"
            :value="props.action.description"
            placeholder="Enter the description"
            rows="4"
          />
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Source</span>
            <input readonly class="form-input" label="name" :value="props.action.actionSource.name" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Risk</span>
            <input :disabled="['Issue', 'Legal Register', 'Other', 'SWOT'].includes(props.action.actionSource.name)" readonly class="form-input" label="description" :value="props.action.risk?.description ?? '---'" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-item flex-1">
            <span class="form-label">Department</span>
            <vue-select
                v-model="selectedDepts"
                :options="departments"
                :reduce="(dept: any) => dept.depId"
                label="name"
                multiple
                disabled
                placeholder="Select Locations"
                class="inside-scroll-modal"
            />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Location</span>
            <vue-select
                v-model="selectedLocs"
                :options="locations"
                :reduce="(loc: any) => loc.locId"
                label="name"
                multiple
                disabled
                placeholder="Select Locations"
                class="inside-scroll-modal"
            />
          </div>
        </div>
        <div class="flex space-x-4">
          <div class="form-item flex-1">
            <span class="form-label">Assignee</span>
            <input
              readonly
              class="form-input"
              :value="props.action.assignedUser?.firstName ?? '-' + ' ' + props.action.assignedUser?.lastName ?? '-'"
            />
          </div>
          <div class="form-item flex-1">
            <span class="form-label">ISO Standard</span>
            <input readonly class="form-input" :value="props.action.isoStandard?.name ?? ''" />
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div class="form-item col-span-1 mr-2">
            <span class="form-label">Due Date</span>
            <input readonly class="form-input" :value="formatDate(props.action.dueDate)" />
          </div>
        </div>
        <div class="form-item">
          <span class="form-label">Attachments</span>
          <AttachmentUpload :disabled="true"></AttachmentUpload>
        </div>
        <div class="form-item">
          <span class="form-label">Remarks</span>
          <textarea readonly :value="props.action.remarks ?? '---'" class="form-input" />
        </div>
      </div>
    </template>
  </AppModal>
</template>
