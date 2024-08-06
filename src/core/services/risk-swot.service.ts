import { apiUrl } from './../configs/api-config'
import axios from 'axios'
import { AddRiskSwotPayload, UpdateRiskSwotPayload } from '../models/risk-swot.model'

export function getRiskSwot() {
  return axios.get(`${apiUrl}/risk-swot`)
}

export function addRiskSwot(payload: AddRiskSwotPayload) {
  return axios.post(`${apiUrl}/risk-swot`, payload)
}

export function updateRiskSwot(id: string, payload: UpdateRiskSwotPayload) {
  return axios.put(`${apiUrl}/risk-swot/${id}`, payload)
}

export function deleteRisSwot(id: string) {
  return axios.delete(`${apiUrl}/risk-swot/${id}`)
}

export function createRiskFromSwot(id: string) {
  return axios.post(`${apiUrl}/risk-swot/${id}/create-risk`)
}
