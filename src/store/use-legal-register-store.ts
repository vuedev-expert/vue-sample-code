import { RegisterLegalPayload, UpdateRegisterLegalPayload } from './../core/models/legislation.model'
import { PaginatedResponse, Status } from '@/core/models/common.model'
import { LegalRegister } from '@/core/models/legislation.model'
import { QueryParams } from '@/core/models/query-param.model'
import {
  deleteRegisterLegal,
  getLegalRegister,
  registerLegal,
  subscribeItem,
  updateRegisterLegal
} from '@/core/services/legislation.service'
import { defineStore } from 'pinia'

interface State {
  status: Status
  legalRegisterItems: LegalRegister[]
  count: number
}

export const useLegalRegisterStore = defineStore('legalRegisterStore', {
  state() {
    return {
      status: 'idle',
      legalRegisterItems: [],
      count: 0
    } as State
  },
  actions: {
    getLegalItems(query: QueryParams = {}) {
      this.status = 'loading'
      return getLegalRegister(query)
        .then((res :any) => {
          const paginatedResponse = res as unknown as PaginatedResponse<LegalRegister>
          this.legalRegisterItems = paginatedResponse.records
          this.count = paginatedResponse.total
          this.status = 'idle'
          return res
        })
        .catch((err) => {
          this.status = 'error'
          throw err
        })
    },
    subscribeItem(id: string[]) {
      return subscribeItem(id)
    },
    registerItem(payload: RegisterLegalPayload) {
      return registerLegal(payload)
    },
    deleteItem(id: string) {
      return deleteRegisterLegal(id)
    },
    updateRegisterItem(id: string, payload: UpdateRegisterLegalPayload) {
      return updateRegisterLegal(id, payload)
    }
  }
})
