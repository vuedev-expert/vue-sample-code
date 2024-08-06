import { TokenService } from './../helpers/token-service'
import {
  ForgotPasswordPayload,
  ResendCodePayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyCodePayload,
  AdminResetPasswordPayload
} from '@/core/models/auth.model'
import { apiUrl } from './../configs/api-config'
import axios from 'axios'
import {
  ChangePasswordPayload,
  ColumnsPayload, OrgUser,
  UpdateProfilePayload,
  UpdateSupportAdminProfilePayload
} from '../models/user.model'

function signUp(payload: SignUpPayload) {
  return axios.post(`${apiUrl}/auth/register`, payload)
}

function signIn(payload: SignInPayload) {
  if (payload.totpCode != null) {
    return axios.post(`${apiUrl}/auth/login/require-totp-code`, payload)
  } else if (payload.newPassword != null) {
    return axios.post(`${apiUrl}/auth/login/require-new-password`, payload)
  } else {
    return axios.post(`${apiUrl}/auth/login`, payload)
  }
}

function adminSignin(payload: SignInPayload) {
  return axios.post(`${apiUrl}/admin/auth/login`, payload)
}

function forgotPassword(payload: ForgotPasswordPayload) {
  return axios.post(`${apiUrl}/auth/forgot-password`, payload)
}

function adminForgotPassword(payload: ForgotPasswordPayload) {
  return axios.post(`${apiUrl}/admin/forget-password`, payload)
}

function resetPassword(payload: ResetPasswordPayload) {
  return axios.post(`${apiUrl}/auth/confirm-password`, payload)
}

function adminResetPassword(payload: AdminResetPasswordPayload) {
  return axios.post(`${apiUrl}/admin/confirm-forget-password`, payload)
}

function changeUserPassword(payload: ChangePasswordPayload) {
  return axios.put(`${apiUrl}/auth/change-password`, payload)
}

function updateUserProfile(usrId: any, payload: UpdateProfilePayload) {
  return axios.put(`${apiUrl}/update-profile-info/${usrId}`, payload)
}

function updateSupportAdminProfile(usrId: any, payload: UpdateSupportAdminProfilePayload) {
  return axios.put(`${apiUrl}/admin/${usrId}/update-profile-info`, payload)
}

function fetchUserInfo() :Promise<OrgUser> {
  return axios.get(`${apiUrl}/auth/me`)
}
function fetchAdminInfo() {
  return axios.get(`${apiUrl}/admin/auth/me`)
}
function toggleTableColumns(payload :ColumnsPayload) :Promise<OrgUser> {
  return axios.patch(`${apiUrl}/filter`, payload)
}

function verifyCode(payload: VerifyCodePayload) {
  return axios.post(`${apiUrl}/auth/verify-code`, payload)
}

function resendCode(payload: ResendCodePayload) {
  return axios.post(`${apiUrl}/auth/resend-code`, payload)
}

function refreshToken() {
  const auth = TokenService.getAuth()
  const user = TokenService.getUser()
  if (auth && user)
    return axios.post(`${apiUrl}/auth/refresh-token`, {
      refreshToken: auth.refreshToken?.token,
      username: user.username
    })
  return Promise.reject(null)
}

function associateSoftwareToken(refreshToken: string) {
  return axios.post(`${apiUrl}/auth/associate-software-token`, { refreshToken })
}

function verifySoftwareToken(refreshToken: string, totpCode: string, friendlyDeviceName: string) {
  return axios.post(`${apiUrl}/auth/verify-software-token`, {
    refreshToken,
    totpCode,
    friendlyDeviceName
  })
}

export {
  signUp,
  signIn,
  adminSignin,
  fetchUserInfo,
  fetchAdminInfo,
  verifyCode,
  resendCode,
  refreshToken,
  forgotPassword,
  adminForgotPassword,
  resetPassword,
  adminResetPassword,
  toggleTableColumns,
  associateSoftwareToken,
  verifySoftwareToken,
  updateUserProfile,
  updateSupportAdminProfile,
  changeUserPassword
}
