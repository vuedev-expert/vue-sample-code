export type SortDirection = 'ASC' | 'DESC' | ''
export const rotate: { [key: string]: SortDirection } = { ASC: 'DESC', DESC: '', '': 'ASC' }
export interface SortableColumn {
  label: string
  fullLabel: string
  field: string
  sortable: boolean
  class?: string
  headClass?: string
  allowCB?: boolean
  persist?: boolean
  hasInfo?: boolean
  infoText?: string
}
export interface SortInfo {
  col: string
  direction: SortDirection
}
export interface PageInfo {
  take: number
  skip: number
}

export interface PaginationInfo {
  total: number
  pageSize: any
  current: number
  sibling: number
}

export const pageSizes: number[] = [10, 15, 20, 25, 30]

export const lgPageSizes: number[] = [10, 25, 50, 100]
