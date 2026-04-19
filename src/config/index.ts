const stripTrailingSlash = (url: string): string => url.replace(/\/$/, '')

const readEnvString = (key: keyof ImportMetaEnv): string | undefined => {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return undefined
  return String(raw)
}

/**
 * Central place for environment-driven configuration (Vite `VITE_*` variables).
 */
export const config = {
  authApiBaseUrl: stripTrailingSlash(
    readEnvString('VITE_AUTH_API_BASE_URL') ?? 'http://localhost:8081',
  ),
  /** Dashboard backend (products, orders, etc.) — no trailing slash */
  dashboardApiBaseUrl: stripTrailingSlash(
    readEnvString('VITE_DASHBOARD_API_BASE_URL') ?? 'http://localhost:8082/ml-dashboard',
  ),
  apiBaseUrl: (() => {
    const v = readEnvString('VITE_API_BASE_URL')
    return v ? stripTrailingSlash(v) : null
  })(),
  /** Header avatar image URL */
  topbarAvatarUrl:
    readEnvString('VITE_TOPBAR_AVATAR_URL') ?? 'https://i.pravatar.cc/128?img=68',
  appTitle: readEnvString('VITE_APP_TITLE') ?? 'ML Dashboard',
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
} as const

export type AppConfig = typeof config
