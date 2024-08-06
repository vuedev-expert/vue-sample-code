import axios from 'axios'
import { apiUrl } from '@/core/configs/api-config'
import { OrgInfoPayload ,RiskMatrixSwapPayload} from '@/core/models/org.model'

function fetchOrg(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}`)
}

function updateOrg(orgId: string, payload: OrgInfoPayload) {
  return axios.put(`${apiUrl}/organizations/${orgId}`, payload)
}

function updateRiskMatrixSwap(orgId: string, payload: RiskMatrixSwapPayload) {
  return axios.put(`${apiUrl}/organizations/${orgId}`, payload)
}

export { fetchOrg, updateOrg,updateRiskMatrixSwap }
