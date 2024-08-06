import { OrgLocation } from '@/core/models/org-location.model'
import { OrgDepartment } from '@/core/models/org-department.model'
import { Role } from './role.model'
export interface OrgUser {
  firstName: string
  lastName: string
  fullName: string
  usrId: string
  username: string
  email: string
  phoneNumber: string
  role: Role
  rolId: string
  isActive: boolean
  orgId?: string
  isCurrentUser?: string
  isFirstLogin: boolean
  mfaRegistered: boolean
  isLoginFromInvite: boolean
  isDisabledFromCognito: boolean
  hideInviteButton: boolean
  departments: OrgDepartment[]
  departmentString?: string[]
  locations: OrgLocation[]
  locationString?: string[]
  organization: any
  stripeLineItem: any
  riskFilter: string | null
  issueFilter: string | null
  actionFilter: string | null
}

export interface AddUserPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  locIds: string[]
  depIds: string[]
}
export interface AddTempUserPayload {
  firstName: string
  lastName: string
  email: string
  orgId: string
}
export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  depIds?: string[]
  locIds?: string[]
  username?: string
}


export interface UpdateProfilePayload {
  firstName?: string|null
  usrId?:any|null
  lastName?: string|null
  phoneNumber?: string|null
}

export interface UpdateSupportAdminProfilePayload {
  firstName?: string|null
  usrId?:any|null
  lastName?: string|null
  email?: string|null
  phoneNumber?: string|null
}


export interface ChangePasswordPayload {
  oldPass?: string
  newPass?: string
  confirmNewPass?: string
}

export interface ChangeUserPasswordPayload {
  email: string
  newPassword: string
}

export interface ResendInvitePayload {
  email: string
  username: string
}

export interface ColumnsPayload {
  riskFilter?: string
  issueFilter?: string
  actionFilter?: string
}
