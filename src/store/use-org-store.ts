import { defineStore } from 'pinia'
import { OrgInfoPayload, RiskMatrixSwapPayload } from '@/core/models/org.model'
import { fetchOrg, updateOrg ,updateRiskMatrixSwap} from '@/core/services/org/org-info.service'
import ToastService from '@/core/helpers/toast-service'
import { Status } from '@/core/models/common.model'

export interface OrgState {
  status: Status
  info?: OrgInfoPayload
}

export const useOrgStore = defineStore('orgStore', {
  state: () =>
    ({
      status: 'idle',
      info: undefined
    } as OrgState),
  actions: {
    fetch(orgId: string) {
      this.status = 'loading'
      fetchOrg(orgId)
        .then((res: any) => {
          this.status = 'idle'
          this.info = res as OrgInfoPayload
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    },
    updateInfo(orgId: string, payload: OrgInfoPayload) {
      this.status = 'loading'
      return updateOrg(orgId, payload)
        .then(() => {
          this.status = 'idle'
          this.info = { ...this.info, ...payload }
          ToastService.success('Updated organization information successfully!')
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    },
    updateRiskMatrixSwaping(orgId: string, payload: RiskMatrixSwapPayload) {
      this.status = 'loading'
      return updateRiskMatrixSwap(orgId, payload)
        .then(() => {
          this.status = 'idle'
          ToastService.success('Risk matrix order swap successfully!');
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    }
  }
})
