<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue'
import { arc, pie, PieArcDatum, select } from 'd3'
import useResizeObserver from '@/core/use/resizeObserver'
import { ReportResponse } from '@/core/models/report.model'
import { ActionPieChartStatusColor, ActionStatusName } from '@/core/models/action.model'

const props = defineProps<{ data: ReportResponse[] }>()
// create ref to pass to D3 for DOM manipulation
const svgRef = ref(null)
const tooltipRef = ref(null)
// create another ref to observe resizing, since observing SVGs doesn't work!
const { resizeRef, resizeState } = useResizeObserver()
const adjustedData = ref<ReportResponse[]>(props.data)

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value)
  const tooltip = select(tooltipRef.value)
  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    const { width, height } = resizeState.dimensions

    const radius = Math.min(width, height) / 2
    svg.attr('width', width).attr('height', height)
    const wrapper = svg.select('g.wrapper').attr('transform', `translate(${width / 2},${height / 2})`)
    const total = props.data.reduce((memo, it) => memo + it.value, 0) || 1
    adjustedData.value = props.data.map((it) => ({ ...it, value: Math.round((it.value * 100) / total) }))
    const data = pie<ReportResponse>().value((d) => d.value)(adjustedData.value)
    const path = arc<PieArcDatum<ReportResponse>>().innerRadius(0).outerRadius(radius)

    wrapper.selectAll('.pie').remove()
    wrapper
      .selectAll('.pie')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'pie')
      .attr('d', path)
      .attr('fill', (d) => ActionPieChartStatusColor[d.data.key])
      .attr('stroke', 'white')
      .style('stroke-width', '2')
      .style('opacity', 1)
      .on('mousemove', (event, d) => {
        tooltip
          .html(`${ActionStatusName[d.data.key]} (${d.data.value}%)`)
          .style('opacity', 1)
          .style('color', ActionPieChartStatusColor[d.data.key])
          .style('left', `${event.pageX + 2}px`)
          .style('top', `${event.pageY - 32}px`)
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0)
      })
  })
})
</script>

<template>
  <div class="flex flex-col space-y-6">
    <div ref="resizeRef" class="flex-1 h-full w-full items-center justify-center relative">
      <svg ref="svgRef">
        <g class="wrapper"></g>
      </svg>
      <div ref="tooltipRef" class="tooltip fixed text-center border border-primary-100" />
    </div>

    <div class="legend grid gap-6 md:grid-cols-2">
      <div v-for="item in adjustedData" :key="item.key" class="flex-1 flex justify-center items-center">
        <div class="w-2 h-2 rounded" :style="{ backgroundColor: ActionPieChartStatusColor[item.key] }"></div>
        <div class="ml-2 flex-1 whitespace-nowrap">{{ ActionStatusName[item.key] }}</div>
        <div class="ml-5">{{ item.value }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  padding: 5px 10px;
  border-radius: 2px;
  opacity: 0;
  background: white;
}
</style>
