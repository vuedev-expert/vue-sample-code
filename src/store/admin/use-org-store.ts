import { PaginatedResponse, Status } from '@/core/models/common.model'
import { QueryParams } from '@/core/models/query-param.model'
import {
    deleteOrg,
    getAllOrganizations,
    getAllOrgUsers,
} from '@/core/services/admin/organizations.service'
import { defineStore } from 'pinia'
import { AdminOrg } from "@/core/models/org.model";
import {OrgUser} from "@/core/models/user.model";
import {updateStateActStatus} from "@/core/services/admin/legislation.service";

interface State {
    status: Status
    organizations: AdminOrg[]
    orgCount: number
    orgUsers: OrgUser[]
    orgUsersCount: number
}

export const useAdminOrgStore = defineStore('adminOrgStore', {
    state() {
        return {
            status: 'idle',
            organizations: [],
            orgCount: 0,
            orgUsers: [],
            orgUsersCount: 0
        } as State
    },
    actions: {
        getOrganizations() {
            this.status = 'loading'
            return getAllOrganizations()
                .then((resp) => {
                    this.organizations = resp as unknown as AdminOrg[]
                    this.orgCount = this.organizations.length
                    this.status = 'idle'
                })
                .catch((err) => {
                    this.status = 'idle'
                    return err
                })
        },
        getOrgUsers(orgId :string) {
            this.status = 'loading'
            return getAllOrgUsers(orgId)
                .then((resp) => {
                    this.orgUsers = resp as unknown as OrgUser[]
                    this.orgUsersCount = this.orgUsers?.length
                    this.status = 'idle'
                })
                .catch((err) => {
                    this.status = 'idle'
                    return err
                })
        },
        deleteOrg(orgId :string) {
            this.status = 'loading'
            return deleteOrg(orgId)
                .then((resp) => {
                    console.log('resp ', resp)
                    this.status = 'idle'
                    return resp
                })
                .catch((e) => {
                    this.status = 'idle'
                    return e
                })
        },
    },
})
