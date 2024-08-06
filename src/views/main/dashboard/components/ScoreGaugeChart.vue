<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue'
import { arc, line, select } from 'd3'
import useResizeObserver from '@/core/use/resizeObserver'
import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'

const props = defineProps<{ data: number, exposureLevels: RiskMatrixExposureLevel[] }>()
const margin = 0
const minAngle = -135
const maxAngle = 135
const angleRange = maxAngle - minAngle
const labelInset = 25
const pointerWidth = 10
const pointerTailLength = 5
const pointerHeadLengthPercent = 0.6
// create ref to pass to D3 for DOM manipulation
const svgRef = ref(null)
// create another ref to observe resizing, since observing SVGs doesn't work!
const { resizeRef, resizeState } = useResizeObserver()

const deg2rad = (deg: number) => deg * Math.PI / 180

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value)
  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    const { width, height } = resizeState.dimensions
    const radius = Math.min(width, height) / 2 - margin
    svg.attr('width', width).attr('height', height)
    const wrapper = svg.select('g.wrapper').attr('transform', `translate(${width / 2},${height / 2})`)
    const maxValue = props.exposureLevels.reduce((memo, it) => it.toValue > memo ? it.toValue : memo, 1)
    const getAngle = (value: number) => minAngle + (value / maxValue) * angleRange
    const dataAngle = getAngle(props.data)
    const path = arc<RiskMatrixExposureLevel>()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle((d) => {
        const fromValue = d.fromValue - 1
        return deg2rad(getAngle(fromValue <= 0 ? 0 : fromValue))
      })
      .endAngle((d) => deg2rad(getAngle(d.toValue)))
    const pointerHeadLength = Math.round(radius * pointerHeadLengthPercent)
    const lineData = [[pointerWidth / 2, 0],
      [0, -pointerHeadLength],
      [-(pointerWidth / 2), 0],
      [0, pointerTailLength],
      [pointerWidth / 2, 0]]
    const pointerLine = line<number[]>()


    wrapper.select('.arcs').selectAll('path.pie').remove()
    wrapper.select('.arcs')
      .selectAll('path.pie')
      .data(props.exposureLevels)
      .enter()
      .append('path')
      .attr('class', 'pie')
      .attr('d', path)
      .attr('fill', d => d.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2')
      .style('opacity', 1)

    wrapper.select('.labels').selectAll('text').remove()
    wrapper.select('.labels')
      .selectAll('text')
      .data(props.exposureLevels)
      .enter()
      .append('text')
      .attr('transform', (d, i) => {
        const newAngle = getAngle(i === 0 ? (d.fromValue - 1) : (d.toValue - 1))
        return `rotate(${newAngle}) translate(0,${labelInset - radius})`
      })
      .text((d, i) => i === 0 ? d.fromValue : d.toValue)
      .style('font-size', 12)
      .style('fill', 'gray')

    wrapper.select('.pointer').selectAll('path').remove()
    wrapper.select('.pointer')
      .selectAll('path')
      .data([lineData])
      .enter()
      .append('path')
      .attr('fill', '#F5205A')
      .attr('d', pointerLine)
      .attr('transform', `rotate(${dataAngle})`)
  })
})
</script>

<template>
  <div ref="resizeRef" class="w-full h-full relative">
    <svg ref="svgRef">
      <g class="wrapper">
        <g class="arcs"></g>
        <g class="labels"></g>
        <g class="pointer"></g>
        <circle r="2" fill="white" />
      </g>
    </svg>
    <div class="absolute score-label text-center w-full">
      <div class="score text-2xl">{{ data }}</div>
      <div class="label">Score</div>
    </div>
  </div>
</template>

<style scoped>
.score-label {
  left: 0;
  bottom: 0;
}

.label {
  color: #CECECE;
}
</style>