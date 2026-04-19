import type {
  LoginApiEnvelope,
  LoginCredentials,
  LoginResponse,
} from '../../pages/login/loginTypes'
import axiosInstance from '../../services/axiosInstance'

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data: envelope } = await axiosInstance.post<LoginApiEnvelope>('/auth/login', credentials)

  const inner = envelope?.data
  if (
    !inner ||
    typeof inner.accessToken !== 'string' ||
    typeof inner.refreshToken !== 'string'
  ) {
    throw new Error('Invalid response: missing tokens')
  }

  return {
    accessToken: inner.accessToken,
    refreshToken: inner.refreshToken,
  }
}
