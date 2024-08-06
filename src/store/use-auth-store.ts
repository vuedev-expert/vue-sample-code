import { TokenService } from '@/core/helpers/token-service'
import { RouteNames, AdminRouteNames } from '@/core/models/app-router.model'
import { SignInPayload, SignUpPayload } from '@/core/models/auth.model'
import { defineStore } from 'pinia'
import {
  fetchUserInfo,
  refreshToken,
  resendCode,
  signIn, signUp,
  adminSignin,
  fetchAdminInfo,
  toggleTableColumns } from '@/core/services/auth.services'
import router from '@/router'
import ToastService from '@/core/helpers/toast-service'
import { Status } from '@/core/models/common.model'
import {ColumnsPayload, OrgUser} from '@/core/models/user.model'
import { RoleEnum } from './../core/models/role.model'
import { planProductIds } from "@/core/constants/plans-constants";

interface AuthState {
  status: Status
  error: string
  user?: {
    auth: any
    me: OrgUser
  }
  credentials?: {
    username: string
    password: string
  }
  riskFilters: string | null
  issueFilters: string | null
  actionFilters: string | null
}

export const useAuthStore = defineStore('authStore', {
  state: () =>
    ({
      status: 'idle',
      error: '',
      user: {
        auth: TokenService.getAuth(),
        me: TokenService.getUser()
      },
      riskFilters: null,
      issueFilters: null,
      actionFilters: null
    } as AuthState),
  actions: {
    signUp(payload: SignUpPayload) {
      this.status = 'loading'
      signUp(payload)
        .then(() => {
          this.status = 'idle'
          ToastService.success('Register successfully!')
          router.push({
            name: RouteNames.VERIFY_OTP,
            query: { username: payload.username, email: payload.email }
          })
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
        })
    },
    getUserProfile() {
      console.log('admin yes ', this.isSupportAdmin)
      if (this.isSupportAdmin) {
        return fetchAdminInfo().then((res) => {
          TokenService.setUser(res)
          if (this.user) this.user.me = res as unknown as OrgUser
        })
      }
      else {
        return fetchUserInfo().then((res) => {
          TokenService.setUser(res)
          if (this.user) {
            this.user.me = res as unknown as OrgUser
            this.riskFilters = res.riskFilter
            this.issueFilters = res.issueFilter
            this.actionFilters = res.actionFilter
          }
        })
      }
    },
    async signIn(payload: SignInPayload) {
      try {
        this.status = 'loading'
        const auth = (await signIn(payload)) as any
        if (auth['needToReset']) {
          ToastService.warn('Please reset your temporary password before using the application!')
          await router.push({ name: RouteNames.NEW_USER_RESET_PASSWORD, query: { username: payload.username } })
        } else if (auth['needTotpCode'] && payload.newPassword != null) {
          this.credentials = payload
          await router.push({ name: RouteNames.SIGN_IN })
        }
        else if (auth['needTotpCode']) {
          this.credentials = payload
          await router.push({ name: RouteNames.MFA_SIGN_IN })
        } else {
          this.credentials = undefined

          TokenService.setAuth(auth)
          const me = (await fetchUserInfo()) as unknown as OrgUser

          TokenService.setUser(me)
          this.user = { auth, me }
          if (me.mfaRegistered) {
            await this.toFirstPage()
          } else {
            await router.push({ name: RouteNames.MFA_SETUP })
          }
        }
        this.status = 'idle'
      } catch (err: any) {
        if (err.response?.data?.message === 'User is not confirmed.') {
          await resendCode({ username: payload.username })
          await router.push({
            name: RouteNames.VERIFY_OTP,
            query: { username: payload.username }
          })
          this.status = 'idle'
        } else {
          this.status = 'error'
        }
      }
    },
    async adminSignIn(payload: SignInPayload) {
      this.status = 'loading'
      return adminSignin(payload)
          .then(async (auth :any) => {
            this.status = 'idle'
            TokenService.setAuth(auth)
            const me = (await fetchAdminInfo()) as unknown as OrgUser
            if (me) {
              await TokenService.setUser(me)
              this.user = { auth, me }
              await this.toFirstPage()
            }
          })
          .catch(() => this.status = 'idle')
    },
    toggleColumns(payload :ColumnsPayload) {
      return toggleTableColumns(payload)
          .then((res) => {
            this.riskFilters = res.riskFilter
            this.issueFilters = res.issueFilter
            this.actionFilters = res.actionFilter
            return res
          })
          .catch((e) => {
            throw e
          })
    },
    refreshToken() {
      return refreshToken()
        .then((res) => {
          this.user!.auth = res
          TokenService.setAuth(res)
          return res
        })
        .catch((e) => {
          throw e
        })
    },
    logout() {
      if (this.isSupportAdmin) router.push({ name: AdminRouteNames.ADMIN_SIGN_IN })
      else router.push({ name: RouteNames.SIGN_IN })
      this.user = undefined
      TokenService.logout()
    },
    toFirstPage() {
      const user = this.user?.me
      let routerName = ''
      if (user?.role.name === RoleEnum.OWNER) {
        routerName = AdminRouteNames.LEGISLATIONS
      } else if (user?.role.name === RoleEnum.SUPER_ADMIN && user?.isFirstLogin) {
        routerName = RouteNames.ORGANISATION_DETAILS
      } else if (user?.isFirstLogin) {
        routerName = RouteNames.ORGANISATION_DETAILS
      } else if (user?.role.name === RoleEnum.SUPER_ADMIN) {
        routerName = RouteNames.DASHBOARD
      } else {
        routerName = RouteNames.LEGISLATION_LIBRARY
      }
      return router.push({ name: routerName })
    }
  },
  getters: {
    orgId: (state) => state.user?.me?.orgId ?? '',
    userId: (state) => state.user?.me?.usrId ?? '',
    avatarName: (state) => {
      const me = state.user?.me
      if (me) {
        return `${me.firstName.charAt(0)}${me.lastName.charAt(0)}`
      }
      return ''
    },
    me: (state) => {
      return state.user?.me
    },
    email: (state) => {
      return state.user?.me?.email
    },
    auth: (state) => {
      return state.user?.auth
    },
    userRole: (state) => {
      const me = state.user?.me
      return me?.role
    },
    isSupportAdmin: (state) => {
      return state.user?.me?.role?.name === 'OWNER'
    },
    isSuperAdmin: (state) => {
      return state.user?.me?.role?.name === 'SUPER_ADMIN'
    },
    isManager: (state) => {
      return state.user?.me?.role?.name === 'MANAGER'
    },
    isUser: (state) => {
      return state.user?.me?.role?.name === 'USER'
    },
    hasMfaRegistered: (state) => {
      return state.user?.me?.mfaRegistered
    },
  }
})
