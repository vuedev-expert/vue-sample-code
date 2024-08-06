import {
  AddUserPayload,
  UpdateUserPayload,
  ResendInvitePayload,
  ChangeUserPasswordPayload,
  OrgUser,
  AddTempUserPayload
} from '../../models/user.model'
import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import { toQueryParamsString } from '@/core/helpers/common'
import { QueryParams } from '@/core/models/query-param.model'
import { isProxy, toRaw } from 'vue'

export function getUserList(orgId: string, queryParams: QueryParams) {
  // console.log("queryparams",queryParams.locId);
  try {
    if (isProxy(queryParams.locId) && isProxy(queryParams.depId)) {
      const locIds = toRaw(queryParams.locId)
      const deptIds = toRaw(queryParams.depId)
      const payload = { locIds: locIds, depIds: deptIds }
      // console.log("payload",payload);
      return axios.post(`${apiUrl}/organizations/${orgId}/users-get-by-body`, payload)
    }
  } catch {}
  const query = toQueryParamsString(queryParams)
  return axios.get(`${apiUrl}/organizations/${orgId}/users?${query}`)
}
export function addOrgUser(payload: AddUserPayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/users`, payload)
}
export function getTempUserList(orgId: string) {
  return axios.get(`${apiUrl}/temp-user/${orgId}`)
}
export function addTempOrgUser(payload: AddTempUserPayload) {
  return axios.post(`${apiUrl}/create-temp-user`, payload)
}
export function updateOrgUser(payload: UpdateUserPayload, orgId: string, id: string) {
  return axios.put(`${apiUrl}/organizations/${orgId}/users/${id}`, payload)
}
export function deleteOrgUser(orgId: string, id: string) {
  return axios.delete(`${apiUrl}/organizations/${orgId}/users/${id}`)
}
export function getRoles() {
  return axios.get(`${apiUrl}/roles`)
}
export function reSendInvite(payload :ResendInvitePayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/users/resend-invite`, payload)
}
export function resetUserPassword(payload :ChangeUserPasswordPayload, orgId: string) {
  return axios.post(`${apiUrl}/organizations/${orgId}/users/change-user-password`, payload)
}
export function getSingleUser(orgId :string, usrId :string) :Promise<OrgUser> {
  return axios.get(`${apiUrl}/organizations/${orgId}/users/${usrId}`)
}

