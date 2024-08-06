import { apiUrl } from '../../configs/api-config'
import axios from 'axios'
import { QueryParams } from '../../models/query-param.model'
import { toQueryParamsString } from '../../helpers/common'

export function getStateLegislationsActs(queryParams: QueryParams) {
    const query = toQueryParamsString(queryParams)
    return axios.get(`${apiUrl}/admin/act-links?${query}`)
}

export function updateStateActStatus(payload :{ actLinkId: string, isActive: boolean }) {
    return axios.put(`${apiUrl}/admin/activate-a-link`, payload)
}

export function getSubscribedLegislations() {
    return axios.get(`${apiUrl}/admin/subscribed-legislations`)
}
