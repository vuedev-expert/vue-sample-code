import { PaginatedResponse, Status } from '@/core/models/common.model'
import {
   StateAct,
   SubscribedLeg
} from '@/core/models/legislation.model'
import { QueryParams } from '@/core/models/query-param.model'
import {
    getStateLegislationsActs, getSubscribedLegislations,
    updateStateActStatus
} from '@/core/services/admin/legislation.service'
import { defineStore } from 'pinia'

interface State {
    status: Status
    stateActs: StateAct[]
    stateActsCounts: number
    subscribedLegs: SubscribedLeg[]
}

export const useLegislationLibrary = defineStore('legislationLibrary', {
    state() {
        return {
            status: 'idle',
            stateActs: [],
            stateActsCounts: 0,
            subscribedLegs: []
        } as State
    },
    actions: {
        //  Admin State Legislations
        getStateActs(query: QueryParams = {}) {
            this.status = 'loading'
            return getStateLegislationsActs(query)
                .then((resp) => {
                    const paginatedResponse = resp as unknown as PaginatedResponse<StateAct>
                    this.stateActs = paginatedResponse.records
                    this.stateActsCounts = paginatedResponse.total
                    this.status = 'idle'
                })
                .catch(() => this.status = 'idle')
        },
        updateStateActStatus(payload :{ actLinkId: string, isActive: boolean }) {
            this.status = 'loading'
            return updateStateActStatus(payload)
                .then((resp) => {
                    this.status = 'idle'
                    return resp
                })
                .catch((err) => {
                    this.status = 'idle'
                    throw err
                })
        },
        getSubscribedLegislations() {
            this.status = 'loading'
            return getSubscribedLegislations()
                .then((resp) => {
                    this.status = 'idle'
                    this.subscribedLegs = resp as unknown as SubscribedLeg[]
                })
                .catch(() => this.status = 'idle')
        },
    }
})
