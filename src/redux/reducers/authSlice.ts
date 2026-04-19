import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '../../constants/authStorage'
import type { AuthState, LoginCredentials, LoginResponse } from '../../pages/login/loginTypes'
import { asyncState } from '../../types/common'

const readStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

const readStoredRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

const initialState: AuthState = {
  authToken: readStoredToken(),
  refreshToken: readStoredRefreshToken(),
  login: asyncState(null),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<LoginCredentials>) => {
      void action.payload
      state.login.pending = true
      state.login.error = null
      state.login.data = null
    },
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.login.pending = false
      state.login.data = action.payload
      state.login.error = null
      state.authToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      try {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, action.payload.accessToken)
        localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, action.payload.refreshToken)
      } catch {
        // ignore storage errors
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.login.pending = false
      state.login.error = action.payload
    },
    clearLogin: (state) => {
      state.login = asyncState(null)
    },
    logout: (state) => {
      state.authToken = null
      state.refreshToken = null
      state.login = asyncState(null)
      try {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
        localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
      } catch {
        // ignore storage errors
      }
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, clearLogin, logout } =
  authSlice.actions
export default authSlice.reducer
