import { Status } from '@/core/models/common.model'
import {
    getSingleUser,
    addOrgUser,
    updateOrgUser,
    deleteUser,
    reSendInvite, changeUserPass
} from '@/core/services/admin/users.services'
import { defineStore } from 'pinia'
import {
    AddUserPayload,
    ChangeUserPasswordPayload,
    OrgUser,
    ResendInvitePayload,
    UpdateUserPayload
} from "@/core/models/user.model";
import {Role} from "@/core/models/role.model";

interface UserSetupState {
    status: { list: Status; action: Status }
    userList: OrgUser[]
    userDropdownList: OrgUser[]
    roles: Role[]
}

export const useUserStore = defineStore('adminUserStore', {
    state() {
        return {
            status: { list: 'idle', action: 'idle' },
            userList: [],
            roles: [],
            userDropdownList: []
        } as UserSetupState
    },
    actions: {
        getSingleUser(usrId :string) {
            this.status.list = 'loading'
            return getSingleUser(usrId)
                .then((res) => {
                    this.status.list = 'idle'
                    return res
                })
                .catch((e) => {
                    this.status.list = 'error'
                    throw e
                })
        },
        addUser(payload: AddUserPayload, orgId :string) {
            this.status.action = 'loading'
            return addOrgUser(orgId, payload)
                .then((res) => {
                    this.status.action = 'idle'
                    return res
                })
                .catch((e) => {
                    this.status.action = 'error'
                    throw e
                })
        },
        updateUser(payload: UpdateUserPayload, orgId :string, usrId: string) {
            this.status.action = 'loading'
            return updateOrgUser(orgId, usrId, payload)
                .then((res) => {
                    this.status.action = 'idle'
                    return res
                })
                .catch((e) => {
                    this.status.action = 'error'
                    throw e
                })
        },
        resendInvite(payload :ResendInvitePayload, orgId :string) {
            this.status.action = 'loading'
            return reSendInvite(payload, orgId)
                .then((resp) => {
                    this.status.action = 'idle'
                    console.log('resp ', resp)
                    return resp
                })
                .catch((e) => {
                    this.status.action = 'error'
                    throw e
                })
        },
        deleteUser(orgId :string, usrId :string) {
            this.status.action = 'loading'
            return deleteUser(orgId, usrId)
                .then((res) => {
                    console.log('deleted')
                    this.status.action = 'idle'
                    return res
                })
                .catch((e) => {
                    this.status.action = 'error'
                    throw e
                })
        },


        updatingUserPassword(payload: ChangeUserPasswordPayload) {
            this.status.action = 'loading'
            return changeUserPass(payload)
                .then((res) => {
                    this.status.action = 'idle'
                    return res
                })
                .catch((e) => {
                    this.status.action = 'error'
                    throw e
                })
        },
    },
})
