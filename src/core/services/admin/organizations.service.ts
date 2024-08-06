import { apiUrl } from '../../configs/api-config'
import axios from 'axios'

export function getAllOrganizations() {
    return axios.get(`${apiUrl}/admin/organizations`)
}

export function getAllOrgUsers(orgId :string) {
    return axios.get(`${apiUrl}/admin/${orgId}/users`)
}

export function deleteOrg(orgId :string) {
    return axios.delete(`${apiUrl}/admin/organizations/delete/${orgId}`)
}
