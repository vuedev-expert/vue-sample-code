import { RiskMatrixExposureLevel } from '@/core/models/risk-matrix.model'

type BindingValue = { value: number; configs: RiskMatrixExposureLevel[] }
export default {
  beforeMount(el: any, binding: { value: BindingValue }) {
    el.style.color = getColor(binding.value)
  },
  onMounted(el: any, binding: any) {
    el.style.color = getColor(binding.value)
  },
  updated(el: any, binding: any) {
    el.style.color = getColor(binding.value)
  }
}

const getColor = (value: BindingValue): string => {
  const foundConfig = value.configs.find((it) => it.fromValue <= value.value && it.toValue >= value.value)
  if (foundConfig) {
    return foundConfig.fontColor ?? '#000000'
  } else {
    return '#000000'
  }
}
