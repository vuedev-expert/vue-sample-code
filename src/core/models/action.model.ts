import { OrgDepartment } from '@/core/models/org-department.model'
import { OrgLocation } from './org-location.model'
import { IsoStandard, Risk } from './risk.model'
import { OrgUser } from './user.model'
import {Issue} from "@/core/models/issue-model";

export interface Action {
  actId: string
  description: string
  usrId: string
  assignedUsrId: string | null
  assignedTempUsrId: string | null
  ascId: string
  rskId?: string
  legRegId?: string
  risk?: Risk
  issue?: Issue
  depIds: []
  locIds: []
  // depId: string | null
  // locId: string | null
  isoId: string
  isoStandard: IsoStandard
  dueDate: string
  forecastDate: string
  status: ActionStatus
  orgId: string
  createdAt: Date
  updatedAt: Date
  remarks: string
  actionSource: ActionSource
  locations: OrgLocation[]
  departments: OrgDepartment[]
  assignedUser: OrgUser
  assignedTempUser: any
  attachments: Attachment[]
}
export interface ActionReport {
  action: string
  source: string
  assignee: string
  locations: string
  departments: string
  dueDate: string
  forecastDate: string
  status: string
}

export interface AddActionPayload {
  assignedUsrId: string | null
  assignedTempUsrId: string | null
  ascId: string
  locId: string
  isoId: string
  depId: string
  description: string
  rskId?: string
  dueDate: Date
  forecastDate: Date
  status: ActionStatus
  attachments?: { attId: string }[]
  remarks: string
  assignedUser?: OrgUser
  assignedTempUser?: OrgUser
}

export interface UpdateActionPayload {
  assignedUsrId?: string
  ascId?: string
  locId?: string
  depId?: string
  description?: string
  rskId?: string
  isoId?: string
  dueDate?: Date
  forecastDate?: Date
  completedDate?: Date
  attachments?: { attId: string }[]
}

export interface UpdateActionStatus {
  status: ActionStatus
  approvalComment?: string
}

export interface Attachment {
  attId: string
  actId: string
  name: string
  path: string
  createdAt: Date
  updatedAt: Date
}

export interface ActionSource {
  ascId: string
  name: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export enum ActionStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
export const ActionStatusName: { [key: string]: string } = {
  [ActionStatus.OPEN]: 'Open',
  [ActionStatus.IN_REVIEW]: 'In Review',
  [ActionStatus.APPROVED]: 'Approved',
  [ActionStatus.REJECTED]: 'Rejected'
}
export const ActionStatusColor: { [key: string]: string } = {
  [ActionStatus.OPEN]: '#3AA0FF',
  [ActionStatus.IN_REVIEW]: '#ffcf0f',
  [ActionStatus.APPROVED]: '#44c13c',
  [ActionStatus.REJECTED]: '#ff513a'
}
export const ActionPieChartStatusColor: { [key: string]: string } = {
  [ActionStatus.OPEN]: '#3AA0FF',
  [ActionStatus.IN_REVIEW]: '#ffcf0f',
  [ActionStatus.APPROVED]: '#44c13c',
  [ActionStatus.REJECTED]: '#ff513a'
}

export type ActionActType = 'Send' | 'Approve' | 'Reject'
