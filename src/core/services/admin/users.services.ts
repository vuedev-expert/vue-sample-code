import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import {
    AddUserPayload,
    ChangeUserPasswordPayload, OrgUser,
    ResendInvitePayload,
    UpdateUserPayload
} from "@/core/models/user.model";

export function getSingleUser(usrId: string) :Promise<OrgUser> {
    return axios.get(`${apiUrl}/admin/users/get-one/${usrId}`)
}

export function addOrgUser(orgId :string, payload :AddUserPayload) {
    return axios.post(`${apiUrl}/admin/${orgId}/users/create`, payload)
}

export function updateOrgUser(orgId :string, usrId: string, payload :UpdateUserPayload) {
    return axios.put(`${apiUrl}/admin/${orgId}/users/update/${usrId}`, payload)
}

export function enableOrgUser(usrId: string) {
    return axios.get(`${apiUrl}/admin/users/enable-user/${usrId}`)
}

export function disableOrgUser(usrId: string) {
    return axios.get(`${apiUrl}/admin/users/disable-user/${usrId}`)
}

export function changeUserPass(payload :ChangeUserPasswordPayload) {
    return axios.post(`${apiUrl}/admin/users/change-user-password`, payload)
}

export function deleteUser(orgId :string, usrId :string) {
    return axios.delete(`${apiUrl}/admin/${orgId}/users/delete/${usrId}`)
}

export function reSendInvite(payload :ResendInvitePayload, orgId: string) {
    return axios.post(`${apiUrl}/admin/${orgId}/users/resend-invite`, payload)
}
