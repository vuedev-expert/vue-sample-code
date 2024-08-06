import axios from 'axios'
import { apiUrl } from '@/core/configs/api-config'
import {
  BaseRiskPayload,
  RiskMitigationPayload,
  RiskStatus,
  UpdateRiskStatus,
  UploadRiskPayload
} from '@/core/models/risk.model'
import { QueryParams } from '../models/query-param.model'
import { toQueryParamsString } from '../helpers/common'

export function fetchRisks(queryParams: QueryParams) {
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/risk?${query}`)
}

export function addRisk(payload: BaseRiskPayload) {
  return axios.post(`${apiUrl}/risk`, payload)
}

export function raiseRisk(payload: BaseRiskPayload) {
  return axios.post(`${apiUrl}/risk/raise`, payload)
}

export function addMultipleRisks(payload: UploadRiskPayload[]) {
  return axios.post(`${apiUrl}/risk/multiple`, payload)
}

export function editRisk(rskId: string, payload: BaseRiskPayload) {
  return axios.put(`${apiUrl}/risk/${rskId}`, payload)
}
export function editRaisedRisk(rskId: string, payload: BaseRiskPayload) {
  return axios.put(`${apiUrl}/risk/raise/${rskId}`, payload)
}
export function updateRiskStatusValue(rskId: string, status: RiskStatus) {
  return axios.put(`${apiUrl}/risk/${rskId}`, { status })
}

export function updateRiskMitigations(rskId: string, mitigations: Array<RiskMitigationPayload>) {
  return axios.put(`${apiUrl}/risk/${rskId}`, { mitigations })
}

export function updateRiskStatus(rskId: string, payload: UpdateRiskStatus) {
  return axios.put(`${apiUrl}/risk/${rskId}/status`, payload)
}

export function deleteRisk(rskId: string) {
  return axios.delete(`${apiUrl}/risk/${rskId}`)
}

export function downloadTemplate() {
  return axios
    .get(`${apiUrl}/risk/template/adding-risks/download`)
    .then((res: any) => {
      return fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res}`)
    })
    .then((res) => {
      return res.blob()
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', 'risk-template.xlsx')
      document.body.appendChild(a)
      a.click()
      a.remove()
    })
}
