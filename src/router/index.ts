import {RoleEnum} from '@/core/models/role.model'
import {AppPermission} from '@/core/models/permission.model'
import {useAuthStore} from '@/store/use-auth-store'
import {usePaymentStore} from "@/store/use-payment-store";
import {TokenService} from '@/core/helpers/token-service'
import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import AuthLayout from '@/core/layout/AuthLayout.vue'
import MainLayout from '@/core/layout/MainLayout.vue'
import PaymentLayout from '@/core/layout/PaymentLayout.vue'
import DefaultLayout from '@/core/layout/DefaultLayout.vue'
import SubscriptionLayout from '@/core/layout/SubscriptionLayout.vue'
import {RouteNames, RoutePaths, AdminRouteNames, AdminRoutePaths} from '@/core/models/app-router.model'
import {useLoading} from 'vue-loading-overlay'
import {hasPermission, hasRole} from '@/core/helpers/common'
import {useLegislationLibrary} from "@/store/use-legislation-store";

// Mains
const DashboardRD = () => import('@/views/main/dashboard/DashboardRD.vue')
const RiskManagement = () => import('@/views/main/risks/RiskManagement.vue')
const ActionManagement = () => import('@/views/main/actions/ActionManagement.vue')
const IssueManagement = () => import('@/views/main/issue-management/IssueManagement.vue')
const IssueUploader = () => import('@/views/main/issue-management/IssueUploader.vue')
const RiskSwot = () => import('@/views/main/risks/RiskSwot.vue')
const RiskUploader = () => import('@/views/main/risks/RiskUploader.vue')
const NotificationPage = () => import('@/views/main/NotificationPage.vue')
const UserProfile = () => import('@/views/main/UserProfile.vue')
const ReportExport = () => import('@/views/main/ReportExport.vue')

// Payment
const PricingPlan = () => import('@/views/payment/PricingPlan.vue')
const PaymentSuccess = () => import('@/views/payment/PaymentSuccess.vue')
const PaymentFailure = () => import('@/views/payment/PaymentFailure.vue')
const PaymentExpired = () => import('@/views/payment/PaymentExpired.vue')

// Subscription
const UpdateSubscription = () => import('@/views/payment/UpdateSubscription.vue')

// Auths
const SignIn = () => import('@/views/auth/SignIn.vue')
const SignUp = () => import('@/views/auth/SignUp.vue')
const MfaSignIn = () => import('@/views/auth/MfaSignIn.vue')
const MfaSetup = () => import('@/views/auth/MfaSetup.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')
const ResetPassword = () => import('@/views/auth/ResetPassword.vue')
const NewUserResetPassword = () => import('@/views/auth/NewUserResetPassword.vue')
const VerifyOtp = () => import('@/views/auth/VerifyOtp.vue')

// Admin
const AdminSignIn = () => import('@/views/auth/admin/SignIn.vue')
// Test Template : Dummy Route to Test new templates
const TestTemplate = () => import('@/views/testTemplates.vue')

// Legislation Notifications
const LegislationNotification = () => import('@/views/main/legislation/components/LegislationNotification.vue')

// errors
const UnauthorizedPage = () => import('@/views/errors/401Unauthorized.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: RoutePaths.INITIAL,
    redirect: { name: RouteNames.RISK_MANAGEMENT },
    beforeEnter: [checkAuth],
    component: DefaultLayout,
    children: [
      {
        path: RoutePaths.INITIAL,
        redirect: { name: RouteNames.RISK_MANAGEMENT },
        beforeEnter: [shouldHasPayment],
        component: MainLayout,
        children: [
          {
            path: RoutePaths.DASHBOARD,
            name: RouteNames.DASHBOARD,
            component: DashboardRD,
            meta: { permissions: [AppPermission.REPORT_VIEW] },
            beforeEnter: (to, from, next) => {
              const authStore = useAuthStore()
              if (authStore.isSupportAdmin) next(AdminRoutePaths.LEGISLATIONS)
              if (authStore.isSuperAdmin || authStore.isManager) next()
              else next(RoutePaths.LEGISLATION_LIBRARY)
            },
          },
          {
            path: RoutePaths.TEST_TEMPLATE,
            name: RouteNames.TEST_TEMPLATE,
            component: TestTemplate,
            meta: { permissions: [AppPermission.REPORT_VIEW] }
          },
          {
            path: RoutePaths.ORGANISATION_SETTINGS,
            name: RouteNames.ORGANISATION_SETTINGS,
            redirect: { name: RouteNames.ORGANISATION_DETAILS },
            meta: {
              permissions: [AppPermission.ORGANISATION_ADMIN]
            },
            component: DefaultLayout,
            beforeEnter: (to, from, next) => {
              const authStore = useAuthStore()
              if (authStore.isSuperAdmin) next()
              else next(RoutePaths.LEGISLATION_LIBRARY)
            },
            children: [
              // Code Removed
            ]
          },
          {
            path: RoutePaths.LEGISLATION_LIBRARY,
            name: RouteNames.LEGISLATION_LIBRARY,
            redirect: { name: RouteNames.LEGISLATION_LIBRARY_HOME },
            component: DefaultLayout,
            children: [
              {
                path: RoutePaths.LEGISLATION_LIBRARY_HOME,
                name: RouteNames.LEGISLATION_LIBRARY_HOME,
                component: LegislationLibrary
              },
              {
                path: RoutePaths.SUBSCRIBED_ITEMS,
                name: RouteNames.SUBSCRIBED_ITEMS,
                component: SubcscribedItems
              },
              {
                path: RoutePaths.LEGAL_REGISTER,
                name: RouteNames.LEGAL_REGISTER,
                component: LegalRegister
              },
              {
                path: RoutePaths.LEGISLATION_UPDATES_LIBRARY,
                name: RouteNames.LEGISLATION_UPDATES_LIBRARY,
                component: CompoenentName,
                redirect: { name: RouteNames.LEGISLATION_UPDATES },
                children: [
                  // Code Removed
                   
                ],
              },
              {
                path: RoutePaths.LEGISLATION_NOTIFICATION,
                name: RouteNames.LEGISLATION_NOTIFICATION,
                component: LegislationNotification
              }
            ]
          },
          {
            path: RoutePaths.ACTION_MANAGEMENT,
            name: RouteNames.ACTION_MANAGEMENT,
            component: ActionManagement
          },
        ]
      },
      {
        path: RoutePaths.SUBSCRIPTION,
        component: SubscriptionLayout,
        redirect: { name: RouteNames.UPDATE_SUBSCRIPTION },
        beforeEnter: [shouldHasPayment],
        children: [
          {
            path: RoutePaths.UPDATE_SUBSCRIPTION,
            name: RouteNames.UPDATE_SUBSCRIPTION,
            component: UpdateSubscription
          },
        ],
      },
      {
        path: RoutePaths.PAYMENT,
        redirect: { name: RouteNames.PRICING_PLAN },
        beforeEnter: [shouldNotPayment],
        component: PaymentLayout,
        children: [
          // Code Removed
        ]
      }
    ]
  },

  //  Support Admin Routes
  {
    path: AdminRoutePaths.INITIAL,
    redirect: { name: AdminRouteNames.LEGISLATIONS },
    beforeEnter: [checkAdminAuth],
    component: DefaultLayout,
    children: [
      {
        path: AdminRoutePaths.INITIAL,
        redirect: { name: AdminRouteNames.LEGISLATIONS },
        component: MainLayout,
        children: [
          {
            path: AdminRoutePaths.LEGISLATIONS,
            name: AdminRouteNames.LEGISLATIONS,
            component: Legislations,
          },
          // Code Removed
        ]
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 } // always scroll to top
  },
})

async function checkAuth() {
  // Code Removed

  const auth = TokenService.getAuth()
  const user = TokenService.getUser()
  if (!auth || !user) {
    TokenService.logout()
    loader.hide()
    return { name: RouteNames.SIGN_IN }
  }
  const isExpired = TokenService.isTokenExprired()
  const authStore = useAuthStore()
  if (isExpired) {
    try {
      await authStore.refreshToken()
      await authStore.getUserProfile()
      loader.hide()
      return true
    } catch (error) {
      TokenService.logout()
      loader.hide()
      return { name: RouteNames.SIGN_IN }
    }
  }
  await authStore.getUserProfile()
  loader.hide()
  return true
}

async function checkAdminAuth() {
  const authStore = useAuthStore()
  if (authStore.isSupportAdmin) return true
  else return { name: RouteNames.DASHBOARD }
}

router.beforeResolve((to, from, next) => {
  const permissions: AppPermission[] = (to.meta.permissions ?? []) as unknown as AppPermission[]
  const roles: RoleEnum[] = (to.meta.roles ?? []) as unknown as RoleEnum[]
  if (!hasPermission(permissions) || !hasRole(roles)) next({ name: RouteNames.UNAUTHORIZED })
  else next()
})

export default router
