<script lang="ts" setup>
import { ReportResponse, RiskReportResponse } from '@/core/models/report.model'
import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'
import { onMounted, ref, watchEffect } from 'vue'
import useResizeObserver from '@/core/use/resizeObserver'
import { axisBottom, axisLeft, scaleBand, scaleLinear, scaleOrdinal, select } from 'd3'

const props = defineProps<{ data: RiskReportResponse[]; exposureLevels: RiskMatrixExposureLevel[] }>()
// create ref to pass to D3 for DOM manipulation
const svgRef = ref(null)
const tooltipRef = ref(null)
// create another ref to observe resizing, since observing SVGs doesn't work!
const { resizeRef, resizeState } = useResizeObserver()
const margin = { top: 10, right: 30, bottom: 20, left: 50 }

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value)
  const tooltip = select(tooltipRef.value)
  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    const { width, height } = resizeState.dimensions
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    svg.attr('width', width).attr('height', height)
    const wrapper = svg.select('g.wrapper').attr('transform', `translate(${margin.left},${margin.top})`)
    const xScale = scaleBand()
      .domain(props.data.map((it) => it.label.trim()))
      .range([0, innerWidth])
      .padding(0.2)
    const maxValue = props.data.reduce((memo, it) => {
      const maxChildValue = it.value.reduce(
        (childMemo, child) => (child.value > childMemo ? child.value : childMemo),
        memo
      )
      return maxChildValue > memo ? maxChildValue : memo
    }, 0)
    const yScale = scaleLinear().domain([0, maxValue]).range([innerHeight, 0])

    wrapper
      .select<SVGSVGElement>('g.x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).tickSize(0))
    wrapper.select<SVGSVGElement>('g.y-axis').call(axisLeft(yScale).ticks(maxValue < 5 ? maxValue : 5))

    const subGroups = props.exposureLevels.map((it) => it.rmeId)
    const xSubScale = scaleBand<string>().domain(subGroups).range([0, xScale.bandwidth()]).padding(0.05)
    const color = scaleOrdinal<string>()
      .domain(subGroups)
      .range(props.exposureLevels.map((it) => it.color))

    wrapper.select('.chart').selectAll('g').remove()

    wrapper.select('.chart')
      .selectAll('g')
      .data(props.data)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${xScale(d.label.trim())}, 0)`)
      .selectAll('rect')
      .data<ReportResponse>((d) => d.value)
      .enter()
      .append('rect')
      .attr('x', (d) => xSubScale(d.key)!)
      .attr('y', (d) => yScale(d.value))
      .attr('width', xSubScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.value))
      .attr('fill', (d) => color(d.key))
      .on('mousemove', (event, d) => {
        tooltip
          .html(`${d.label} (${d.value})`)
          .style('opacity', 1)
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
  <div ref="resizeRef" class="w-full h-full max-h-56">
    <svg ref="svgRef">
      <g class="wrapper">
        <g class="x-axis"></g>
        <g class="y-axis"></g>
        <g class="chart"></g>
      </g>
    </svg>
    <div ref="tooltipRef" class="tooltip fixed text-center border border-primary-100 text-primary-500" />
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
