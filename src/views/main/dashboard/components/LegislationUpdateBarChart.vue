<script setup lang="ts">
import {computed, ref} from 'vue'
import { Bar } from 'vue-chartjs'
import {formatDate} from "@/core/helpers/common";
import {useLegislationLibrary} from "@/store/use-legislation-store";
import {storeToRefs} from "pinia";
import {useRouter} from "vue-router";
import {RouteNames} from "@/core/models/app-router.model";

const router = useRouter()
const legisStore = useLegislationLibrary()

const { legislationUpdateDateRange } = storeToRefs(legisStore)

const props = defineProps<{ legislationData: any[] }>()

const selectedFilter = ref(0)

const data = {
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
  ],
  datasets: [
    {
      label: 'Legal Updates',
      backgroundColor: '#5f79f6',
      barThickness: 30,
      data: [12, 8, 12, 3, 4, 9, 4]
    }
  ]
}

const datasetOptions = {
  label: 'Legal Updates',
  backgroundColor: '#5f79f6',
  barThickness: 30
}

let datesForFiltration = ref([])
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  onClick: (event: any, chartData: any) => {
    const index :number = chartData[0].index
    const selectedLabel :string = barChartData.value.labels[index]
    if (selectedFilter.value == 0) getFirstAndLastDatesOfMonth(selectedLabel)
    if (selectedFilter.value == 1) getStartAndEndDateOfCurrentYear()
    if (selectedFilter.value == 2) getFirstAndLastDatesOfWeek(selectedLabel)
    router.push({ name: RouteNames.LEGISLATION_UPDATES })
  }
}

function getFirstAndLastDatesOfMonth(monthName :string) {
  const monthIndex = new Date(`${monthName} 1, ${new Date().getFullYear()}`).getMonth();
  const firstDate = new Date(new Date().getFullYear(), monthIndex, 1);
  const lastDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);
  legislationUpdateDateRange.value = [firstDate, lastDate]
}

function getStartAndEndDateOfCurrentYear() {
  const today = new Date(); // Get current date
  const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year
  const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31st of current year
  legislationUpdateDateRange.value = [startOfYear, endOfYear]
}

function getFirstAndLastDatesOfWeek(weekString :string) {
  const weekNumber = parseInt(weekString.split(' ')[1]);  // Extract the week number from the string
  const currentYear = new Date().getFullYear();

  // Get the first date of the week
  const firstDateOfYear = new Date(currentYear, 0, 1); // January 1st of current year
  const firstDayOfYear = firstDateOfYear.getDay(); // Day of the week for January 1st
  const daysToAdd = (weekNumber - 1) * 7 - firstDayOfYear + 1;
  const firstDateOfWeek = new Date(currentYear, 0, 1 + daysToAdd);
  // Get the last date of the week
  const lastDateOfWeek = new Date(firstDateOfWeek);
  lastDateOfWeek.setDate(lastDateOfWeek.getDate() + 6);
  legislationUpdateDateRange.value = [firstDateOfWeek, lastDateOfWeek]
}

const barChartData = computed(() => {
  let updatedHistoriesList :any[] = []
  props.legislationData.forEach((item) => {
    if (item.updatedOrgActHistories.length) {
        let latestDate :Date | null = null;
        item.updatedOrgActHistories.forEach((item :any) => {
          const currentDate = item.modifiedAt;
          if (!latestDate || currentDate > latestDate) latestDate = currentDate;
        });

        if(latestDate) updatedHistoriesList.push(latestDate)
    }
  })
  const result = filterData(updatedHistoriesList, selectedFilter.value)
  return {
    labels: result.labels,
    datasets: [
      {
        data: Object.entries(result.counts).map((val) => val[1]),
        ...datasetOptions
      }
    ]
  }
})

function filterData(data :any[], selectedFilter :number | string) {
  const counts :any = {};
  const labels :string[] = [];
  const formattedDates :any = {};

  data.forEach(item => {
    const date = new Date(item);
    let label :string = '';

    // Filter data based on the selected option
    if (selectedFilter == 0) {
      label = date.toLocaleString('default', { month: 'long' });
    } else if (selectedFilter == 1) {
      label = date.getFullYear().toString();
    } else if (selectedFilter == 2) {
      label = `Week ${getISOWeek(date)}`;
    }

    // Increment count for the label
    counts[label] = (counts[label] || 0) + 1;
    if (!formattedDates[label]) {
      formattedDates[label] = [];
    }
    formattedDates[label].push(formatDate(date));

    // Add label to the labels array if it doesn't exist
    if (!labels.includes(label)) {
      labels.push(label);
    }
  });

  datesForFiltration.value = formattedDates

  // Sort labels in ascending order
  // labels.sort();
  return { labels, counts };
}

// Function to get ISO week number
function getISOWeek(date :Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((Number(d) - Number(yearStart)) / 86400000) + 1) / 7);
}
</script>

<template>
  <div class="legislation-update-bar-chart bg-[#ffffff] rounded-lg flex flex-col h-[350px] 2xl:h-[475px]" style="box-shadow: 0 4px 20px rgba(13, 10, 44, 0.08);">
    <div class="flex justify-between border-b border-[#e5e5ef] pt-4 pb-2.5 items-center px-5">
      <h3 class="text-base 2xl:text-xl font-bold text-center">
        Legal Updates
      </h3>

      <div v-if="legislationData.length" class="flex items-center justify-end shrink-0 w-2/5 2xl:w-1/4">
        <select v-model="selectedFilter" class="form-select" aria-label="Default select example">
          <option value="0">Monthly</option>
<!--          <option value="1">Yearly</option>-->
          <option value="2">Weekly</option>
        </select>
      </div>
    </div>

    <div v-if="legislationData.length" class="px-2 py-6 h-full flex-1 flex items-center">
      <div class="w-full h-full pr-4">
        <Bar :data="barChartData" :options="options" style="height: 100%" />
      </div>
    </div>

    <div v-else class="flex justify-center items-center h-full px-4 text-center py-20">
      <p>No Updates! We'll notify you once we receive an update</p>
    </div>
  </div>
</template>

<style scoped>
.legislation-update-bar-chart .form-select{
  font-size: 13px;
  padding: 2px 12px;
  width: 100px;
}
</style>
