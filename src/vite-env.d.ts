/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_BASE_URL?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DASHBOARD_API_BASE_URL?: string
  readonly VITE_TOPBAR_AVATAR_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
