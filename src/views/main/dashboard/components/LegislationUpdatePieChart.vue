<script setup lang="ts">
import {computed} from "vue";
import {Doughnut} from "vue-chartjs";
import {legislationUpdatePieChart} from "@/core/helpers/charts";
import {RouteNames} from "@/core/models/app-router.model";
import {LegislationUpdatesStatus, LegislationUpdatesStatusColor} from "@/core/models/legislation.model";
import {useRouter} from "vue-router";
import {ActionStatus} from "@/core/models/action.model";
import {useLegislationLibrary} from "@/store/use-legislation-store";

const props = defineProps<{ readUpdates: number, unreadUpdates: number }>()

const router = useRouter();
const legisStore = useLegislationLibrary()

const legislationPieDataSet = computed(() => {
  return {
    labels: ['Read', 'Unread'],
    datasets: [
      {
        data: [props.readUpdates, props.unreadUpdates],
        borderWidth: 2,
        hoverOffset: 4,
        borderRadius: 10,
        spacing: 0,
        backgroundColor: [LegislationUpdatesStatusColor['READ'], LegislationUpdatesStatusColor['UNREAD']]
      }
    ]
  }
})

const pieChartOptions = {
  ...legislationUpdatePieChart,
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyleWidth: 22,
        pointStyleHeight: 22,
        padding: 30,
        font: {
          size: 16
        }
      }
    },
  },
  onClick: (event: any, chartData: any) => {
    let status = ''
    legislationPieDataSet.value.labels.forEach(() => {
      if (chartData[0].index === 0) status = 'true'   // Read Case
      else if (chartData[0].index === 1) status = 'false'   // Unread Case
    })
    legisStore.legislationUpdateStatus = status
    router.push({ name: RouteNames.LEGISLATION_UPDATES })
  },
  onHover: function (e :any, item :any) {
    const tooltip = document.getElementById('tooltipValue')
    if (item.length && tooltip) {
      tooltip.innerHTML = item[0].element.$context.parsed
    } else if (tooltip) tooltip.innerHTML = `${props.readUpdates + props.unreadUpdates}`
  }
}
</script>

<template>
  <div class="bg-[#ffffff] rounded-lg pt-6 pb-2 2xl:pb-3 flex flex-col px-1 h-[350px] 2xl:h-[475px]" style="box-shadow: 0 4px 20px rgba(13, 10, 44, 0.08);">
    <h3 class="text-base 2xl:text-xl font-bold text-center px-4 pb-3 2xl:pb-5">
      Legal Updates <span class="text-primary-500">- User Actions</span>
    </h3>
    <div
        v-if="readUpdates || unreadUpdates"
        class="legislation-updates-piechart relative mx-auto w-full flex items-center flex-1 2xl:px-3"
    >
      <Doughnut
          :data="legislationPieDataSet"
          :options="pieChartOptions"
          style="cursor: pointer;"
      />

      <span
          id="tooltipValue"
          class="absolute top-[37%] 2xl:top-[40%] left-1/2 transform -translate-x-1/2 font-bold text-[50px]">
       {{ readUpdates + unreadUpdates }}
      </span>
    </div>
    <div v-else class="flex justify-center items-center h-full px-4 text-center py-20">
      <h3 class="py-10 xl:py-0">No Updates! We'll notify you once we receive an update</h3>
    </div>
  </div>
</template>

<style scoped>

</style>
