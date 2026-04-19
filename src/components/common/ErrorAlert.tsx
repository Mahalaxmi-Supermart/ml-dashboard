import Alert from '@mui/material/Alert'
import type { AlertProps } from '@mui/material/Alert'

type ErrorAlertProps = {
  error: string | null
} & Omit<AlertProps, 'severity' | 'children'>

export function ErrorAlert({ error, ...rest }: ErrorAlertProps) {
  if (!error) return null
  return (
    <Alert severity="error" {...rest}>
      {error}
    </Alert>
  )
}
