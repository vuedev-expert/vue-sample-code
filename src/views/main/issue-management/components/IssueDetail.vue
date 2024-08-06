<script lang="ts" setup>
import {computed, onMounted, onUnmounted} from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/use-auth-store'
import {formatDate} from '@/core/helpers/common'
import {MutltiSelectDropDownItem} from '@/core/models/common.model'
import { Issue } from "@/core/models/issue-model";

const priorityType = computed(() => props.issue.priorityType.charAt(0).toUpperCase() + props.issue.priorityType.slice(1).toLowerCase())

const props = defineProps<{ issue: Issue }>()

const emits = defineEmits(['close'])
const authStore = useAuthStore()
const { userDepartments } = storeToRefs(authStore)

const departments = computed<MutltiSelectDropDownItem[]>(() =>
    userDepartments.value.map((r) => ({ id: r.depId, name: r.name }))
)

const selectedDepts =computed(() => props.issue.departments.map((dept :any) => dept.depId))
</script>
<template>
  <AppModal
      title="Issue Detail"
      :has-footer="false"
      width="768px"
      @close="(value: any) => emits('close', value)"
  >
    <template #body>
      <form>
        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">GENERAL INFORMATION</div>
        <div class="form-item">
          <span class="form-label">Description</span>
          <textarea
              id="descField"
              :value="props.issue.description"
              class="form-input"
              placeholder="Enter the description"
              rows="4"
          />
        </div>

        <div class="flex flex-col md:flex-row">
          <div class="form-item flex-1 md:mr-4">
            <span class="form-label">ISO Standard</span>
            <input readonly class="form-input" :value="props.issue?.iso?.name" />
          </div>

          <div class="form-item flex-1">
            <span class="form-label">Owner</span>
            <input readonly class="form-input" :value="props.issue?.owner?.fullName" />
          </div>
        </div>

        <div class="uppercase font-semi-bold text-gray-400 text-lg mb-4">RELATED INFORMATION</div>

        <div class="flex flex-col md:flex-row md:gap-4">
          <div class="form-item flex-1 mb-2 md:mb-6">
            <span class="form-label">Location</span>
            <input readonly class="form-input" :value="props.issue?.location?.name" />
          </div>

          <div class="form-item flex-1 mb-6">
            <span class="form-label">Departments</span>
            <vue-select
                v-model="selectedDepts"
                :options="departments"
                label="name"
                :reduce="(dept: any) => dept.id"
                multiple
                disabled
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1">
            <span class="form-label">Issue Type</span>
            <input readonly class="form-input" :value="props.issue?.issueType" />
          </div>
          <div class="form-item flex-1">
            <span class="form-label">Date of Occurrence</span>
            <input readonly class="form-input" :value="formatDate(props?.issue?.dateOfOccurrence)" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-2 md:gap-4">
          <div v-if="props.issue?.issueType === 'Others'" class="form-item mb-0 flex-1">
            <span class="form-label">Others</span>
            <input readonly class="form-input" :value="props?.issue?.othersText" />
          </div>
          <div v-else class="flex-1" />
          <div class="form-item flex-1">
            <span class="form-label">Priority Type</span>
            <input readonly class="form-input" :value="priorityType" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="form-item flex-1">
            <span class="form-label">Due Date</span>
            <input readonly class="form-input" :value="formatDate(props?.issue?.dueDate)" />
          </div>
          <div class="flex-1"></div>
        </div>

        <template v-if="props.issue.whys">
          <div class="uppercase font-semi-bold text-gray-400 text-lg mb-2">RISK ANALYSIS</div>

          <div>
            <template v-for="(field, i) in props.issue.whys" :key="i">
              <div class="flex flex-col md:flex-row gap-4">
                <div class="form-item flex-1">
                  <span class="form-label">Question</span>
                  <input readonly class="form-input" :value="field?.question || '---'"/>
                </div>
                <div class="form-item flex-1">
                  <span class="form-label">Answer</span>
                  <input readonly class="form-input" :value="field?.answer || '---'"/>
                </div>
              </div>
            </template>
          </div>
        </template>
      </form>
    </template>
  </AppModal>
</template>

