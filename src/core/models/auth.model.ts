export interface SignUpPayload {
  firstName: string
  lastName: string
  username: string
  password: string
  phoneNumber: string
  orgName: string
  email: string
}

export interface SignInPayload {
  username: string
  password: string
  newPassword?: string
  totpCode?: string
}

export interface VerifyCodePayload {
  username: string
  code: string
}

export interface ResendCodePayload {
  username: string
}

export interface ForgotPasswordPayload {
  username: string
}

export interface ResetPasswordPayload {
  username: string
  verificationCode: string
  newPassword: string
}

export interface AdminResetPasswordPayload {
  username: string
  confirmationCode: string
  newPassword: string
}
