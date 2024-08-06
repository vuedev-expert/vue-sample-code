import axios, {AxiosRequestConfig} from 'axios'
import {useToast} from 'vue-toastification'
import {TokenService} from '@/core/helpers/token-service'
import {useAuthStore} from '@/store/use-auth-store'
import router from '@/router'
import {RouteNames, AdminRouteNames} from "@/core/models/app-router.model"

const unprotected = ['signin', 'signup', 'adminSignin', 'adminResetPassword', 'adminForgotPassword', 'forgotPassword', 'newUserResetPassword', 'resetPassword', 'verify', 'mfaSignIn', 'mfaSetup']

const axiosApiInstance = axios.create()
const baseUrl = import.meta.env.VITE_API_URL
const idleTime = import.meta.env.VITE_IDLE_TIME

function loggingOut() {
  const _authStore = useAuthStore()
  if (!unprotected.includes(<string>router.currentRoute.value.name)) {
    if (_authStore.isSupportAdmin) router.push({name: AdminRouteNames.ADMIN_SIGN_IN})
    else router.push({name: RouteNames.SIGN_IN})
    _authStore.logout()
  }
}

let timeoutId:ReturnType<typeof setTimeout>
const resetTimeout = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    loggingOut()
  }, idleTime * 60000)
};

let networkErrorCount = 0
axios.interceptors.response.use(
  function (response) {
    return response.data
  },
  async function (error) {
    const toast = useToast()
    const message = error?.response?.data?.message ?? error.message
    if (message === 'Network Error' && networkErrorCount < 2) {
      networkErrorCount++
      const response = await axios.request(error.config)
      networkErrorCount = 0
      return response
    }
    networkErrorCount = 0
    const _authStore = useAuthStore()
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      toast.error(message)
      await loggingOut()
      return Promise.reject(error)
    }
    if (
      error?.config?.headers?.Authorization &&
      !error.config.url.includes('refresh-token')
    ) {
      console.log('above try ', error)
      try {
        if (TokenService.isTokenExprired()) {
          await _authStore.refreshToken()
          const originalRequest = error.config
          return axiosApiInstance(setAuthHeader(originalRequest))
        } else {
          if (message !== 'Network Error' && message !== 'Users exceeded.') toast.error(message)
          return Promise.reject(error)
        }
      } catch (error) {
        toast.error(message)
        _authStore.logout()
        return Promise.reject(error)
      }
    } else {
      if (Array.isArray(message)) {
        const errMsg = message.join('. ')
        toast.error(errMsg)
      } else {
        if (message !== 'Network Error' && message !== 'Users exceeded.') toast.error(message)
      }
      return Promise.reject(error)
    }
  }
)

axios.interceptors.request.use(
  function (config) {
    resetTimeout();
    return setAuthHeader(config)
  },
  function (error) {
    return Promise.reject(error)
  }
)

function setAuthHeader(config: AxiosRequestConfig<any>): AxiosRequestConfig<any> {
  const idToken = TokenService.getIdToken()
  if (idToken && config.headers && config.url?.startsWith(baseUrl)) {
    config.headers.Authorization = `Bearer ${idToken}`
  }

  return config
}
