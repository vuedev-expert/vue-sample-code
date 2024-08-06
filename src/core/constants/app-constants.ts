export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/

export const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{7,29}$/

export const ORG_CODE_REGEX = /^[0-9A-Za-z]{4,5}$/
export const REQUIRED_THREE_CHARACTERS = /(.*[a-z]){3}/i
