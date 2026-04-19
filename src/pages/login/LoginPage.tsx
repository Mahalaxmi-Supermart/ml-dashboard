import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { clearLogin, loginRequest } from '../../redux/reducers/authSlice'
import type { LoginCredentials } from './loginTypes'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { login, authToken } = useAppSelector((s) => s.auth)

  const { control, handleSubmit } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (authToken) {
      navigate('/', { replace: true })
    }
  }, [authToken, navigate])

  useEffect(() => {
    if (login.data && authToken) {
      navigate('/', { replace: true })
      dispatch(clearLogin())
    }
  }, [login.data, authToken, navigate, dispatch])

  const onSubmit = (data: LoginCredentials) => {
    dispatch(loginRequest(data))
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: 1, maxWidth: 420 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email and password to continue.
          </Typography>

          <ErrorAlert error={login.error} sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Password is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={login.pending}
            >
              {login.pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
