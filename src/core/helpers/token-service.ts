import { resetAllStores } from '@/store/pinia'

export class TokenService {
  static getLocalRefreshToken() {
    const user = TokenService.getAuth()
    return user?.refreshToken
  }

  static getLocalAccessToken() {
    const user = TokenService.getAuth()
    return user?.accessToken
  }

  static getIdToken() {
    const user = TokenService.getAuth()
    return user?.idToken?.jwtToken
  }

  static getExpiredTime() {
    const token = TokenService.getLocalAccessToken()
    return token?.payload?.exp
  }

  static isTokenExprired(): boolean {
    const exp = TokenService.getExpiredTime()
    return exp ? Date.now() >= exp * 1000 : true
  }

  static getAuth() {
    const authString = localStorage.getItem('auth')
    return (!!authString && JSON.parse(authString)) || null
  }

  static setAuth(auth: any) {
    localStorage.setItem('auth', JSON.stringify(auth))
  }

  static removeAuth() {
    localStorage.removeItem('auth')
    localStorage.clear()
    console.log('auth')
  }

  static getUser() {
    const userString = localStorage.getItem('user')
    return (!!userString && JSON.parse(userString)) || null
  }

  static setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user))
  }

  static removeUser() {
    localStorage.removeItem('user')
    console.log('user')
  }

  static logout() {
    this.removeAuth()
    this.removeUser()
    resetAllStores();
  }
}
