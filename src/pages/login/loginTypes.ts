import type { AsyncState } from '../../types/common'

export interface LoginCredentials {
  email: string
  password: string
}

/** Tokens returned inside the API `data` object. */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface LoginMeta {
  version: number
  timestamp: string
}

/** Raw login API JSON body. */
export interface LoginApiEnvelope {
  data: LoginResponse
  meta: LoginMeta
}

export interface AuthState {
  authToken: string | null
  refreshToken: string | null
  login: AsyncState<LoginResponse | null>
}
