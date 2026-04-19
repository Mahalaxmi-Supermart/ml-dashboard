import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import type { LoginCredentials } from '../../pages/login/loginTypes'
import { loginFailure, loginRequest, loginSuccess } from '../reducers/authSlice'
import { loginApi } from '../services/authService'

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (typeof data?.message === 'string' && data.message) return data.message
    if (typeof data?.error === 'string' && data.error) return data.error
    return err.message ?? 'Login failed'
  }
  if (err instanceof Error) return err.message
  return 'Login failed'
}

function* loginWorker(action: PayloadAction<LoginCredentials>) {
  try {
    const response: Awaited<ReturnType<typeof loginApi>> = yield call(loginApi, action.payload)
    yield put(loginSuccess(response))
  } catch (err: unknown) {
    yield put(loginFailure(getErrorMessage(err)))
  }
}

export function* authWatcher() {
  yield takeLatest(loginRequest.type, loginWorker)
}
