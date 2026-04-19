import { Box, CircularProgress } from '@mui/material'
import type { ReactNode } from 'react'

type PageLoaderProps = {
  /** When true, children are hidden and the spinner is shown */
  loading: boolean
  children: ReactNode
}

export function PageLoader({ loading, children }: PageLoaderProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  return children
}
