export enum RouteNames {
  // Main
  DASHBOARD = 'dashboard',
  TEST_TEMPLATE = 'testTemplate',
  SIGN_IN = 'signin',
  SIGN_UP = 'signup',
  FORGOT_PASSWORD = 'forgotPassword',
  RESET_PASSWORD = 'resetPassword',
  NEW_USER_RESET_PASSWORD = 'newUserResetPassword',
  VERIFY_OTP = 'verify',
  MFA_SIGN_IN = 'mfaSignIn',
  MFA_SETUP = 'mfaSetup',

  // Payment
  PRICING_PLAN = 'pricingPlan',
  PAYMENT_SUCCESS = 'paymentSuccess',
  PAYMENT_FAILURE = 'paymentFailure',
  PAYMENT_EXPIRED = 'paymentExpired',

  // Subscription
  SUBSCRIPTION = 'subscriptions',
  UPDATE_SUBSCRIPTION = 'updateSubscription',

  // org
  ORGANISATION_SETTINGS = 'organisationSettings',
  ORGANISATION_DETAILS = 'organisationDetails',
  USER_PROFILE = 'userProfile',
  RISK_MATRIX = 'riskMatrix',
  EDIT_RISK_MATRIX = 'editRiskMatrix',
  SWOT = 'swot',
  PAYMENT_DETAILS = 'manageSubscription',
  LEGISLATION_LIBRARY = 'legislationLibrary',
  LEGISLATION_LIBRARY_HOME = 'legislationLibraryHome',
  SUBSCRIBED_ITEMS = 'subscribedItems',
  LEGAL_REGISTER = 'legalRegister',
  LEGISLATION_UPDATES_LIBRARY = 'legislationUpdatesLibrary',
  LEGISLATION_UPDATES = 'legislationUpdates',
  LEGISLATION_ASSOCIATE_RECORDS = 'updatedAssociatedRecords',
  LEGISLATION_NOTIFICATION = 'legislationNotification',

  // main
  ACTION_MANAGEMENT = 'actionManagement',
  RISK_MANAGEMENT = 'riskManagement',
  ISSUE_MANAGEMENT = 'issueManagement',
  ISSUE_UPLOADER = 'issueUploader',
  LOCATIONS = 'locations',
  JOB_FUNCTIONS = 'jobFunctions',
  DEPARTMENTS = 'departments',
  RISK_UPLOADER = 'riskUploader',
  NOTIFICATION = 'notification',
  USER_SETUP = 'userSetup',
  EXPORT_REPORT = 'exportReport',

  // error
  UNAUTHORIZED = 'unAuthorized'
}

export enum RoutePaths {
  // Auth
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  FORGOT_PASSWORD = '/forgot-password',
  RESET_PASSWORD = '/reset-password',
  NEW_USER_RESET_PASSWORD = '/new-user-reset-password',
  VERIFY_OTP = '/verify',
  MFA_SIGN_IN = '/mfa-signin',
  MFA_SETUP = '/mfa-setup',

  // Payment
  PAYMENT = '/payment',
  PRICING_PLAN = 'pricing-plans',
  PAYMENT_SUCCESS = 'payment-success',
  PAYMENT_FAILURE = 'payment-failure',
  PAYMENT_EXPIRED = 'payment-expired',

  // Payment
  SUBSCRIPTION = '/subscription',
  UPDATE_SUBSCRIPTION = 'update-subscription',

  // org
  ORGANISATION_SETTINGS = '/organisation-settings',
  ORGANISATION_DETAILS = 'details',
  USER_SETUP = 'user-setup',
  RISK_MATRIX = 'risk-matrix',
  EDIT_RISK_MATRIX = 'risk-matrix/edit',
  LOCATIONS = 'locations',
  JOB_FUNCTIONS = 'job-functions',
  DEPARTMENTS = 'departments',
  SWOT = '/swot',
  PAYMENT_DETAILS = 'manage-subscription',
  LEGISLATION_LIBRARY = '/legislation-library',
  LEGISLATION_LIBRARY_HOME = 'home',
  SUBSCRIBED_ITEMS = 'subscribed-items',
  LEGAL_REGISTER = 'legal-register',
  LEGISLATION_UPDATES_LIBRARY = 'legislation-updates',
  LEGISLATION_UPDATES = '',
  LEGISLATION_ASSOCIATE_RECORDS = 'legislation-associated-items',
  LEGISLATION_NOTIFICATION = 'legislation-notification',
  // main
  RISK_MANAGEMENT = '/risks',
  ACTION_MANAGEMENT = '/actions',
  ISSUE_MANAGEMENT = '/issue',
  ISSUE_UPLOADER = '/issue-uploader',
  INITIAL = '/',
  DASHBOARD = '/dashboard',
  TEST_TEMPLATE = '/test-template',
  RISK_UPLOADER = '/risk-uploader',
  EXPORT_REPORT = '/export-report',
  NOTIFICATION = '/notifications',
  USER_PROFILE = '/me',

  // error
  UNAUTHORIZED = '/401'
}

export enum AdminRouteNames {
  ADMIN_SIGN_IN = 'adminSignin',
  ADMIN_FORGOT_PASSWORD = 'adminForgotPassword',
  ADMIN_RESET_PASSWORD = 'adminResetPassword',
  CUSTOMERS = 'adminCustomers',
  ORGANIZATIONS = 'adminOrganizations',
  PAYMENT = 'adminSubAndPayments',
  LEGISLATIONS = 'adminLegislations',
  SUBSCRIBED_LEGISLATIONS = 'adminSubscribedLegislations',
  USER_PROFILE = 'adminProfile',

  // error
  UNAUTHORIZED = 'unAuthorized'
}

export enum AdminRoutePaths {
  INITIAL = '/admin',
  ADMIN_SIGN_IN = '/admin/signin',
  ADMIN_FORGOT_PASSWORD = '/admin/forgot-password',
  ADMIN_RESET_PASSWORD = '/admin/reset-password',
  CUSTOMERS = '/admin/customers',
  ORGANIZATIONS = '/admin/organizations',
  PAYMENT = '/admin/subscriptions-and-payments',
  LEGISLATIONS = '/admin/legislations',
  SUBSCRIBED_LEGISLATIONS = '/admin/subscribed-legislations',
  USER_PROFILE = '/admin/profile',

  // error
  UNAUTHORIZED = '/401'
}
