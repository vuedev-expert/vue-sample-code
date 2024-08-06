export type Status = 'idle' | 'loading' | 'error'

export type ModalMode = 'edit' | 'add'

export type ButtonType = 'primary' | 'light' | 'danger' | 'dark' | 'default'

export interface PaginatedResponse<T> {
  total: number
  totalUnread: number
  records: Array<T>
}

export interface AppCredential {
  AccessKeyId: string
  SecretKey: string
  SessionToken: string
  Expiration: string
}

export interface FilterDropDownItem {
  name: string
  id: string | number
  hidden?: boolean
  disabled?: boolean
}


export interface MutltiSelectDropDownItem {
  name: string
  id: string | number
  hidden?: boolean
  disabled?: boolean
}
