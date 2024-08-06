import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import {
  AddOrgDepartmentPayload,
  UpdateOrgDepartmentPayload
} from '../../models/org-department.model'

export function getOrgDepartments(orgId: string) {
  return axios.get(`${apiUrl}/organizations/${orgId}/departments`)
}

export function addOrgDepartment(orgId: string, payload: AddOrgDepartmentPayload) {
  return axios.post(`${apiUrl}/organizations/${orgId}/departments`, payload)
}
export function updateOrgDepartment(
  orgId: string,
  id: string,
  payload: UpdateOrgDepartmentPayload
) {
  return axios.put(`${apiUrl}/organizations/${orgId}/departments/${id}`, payload)
}
export function deleteOrgDepartment(orgId: string, id: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/departments/${id}`)
}
