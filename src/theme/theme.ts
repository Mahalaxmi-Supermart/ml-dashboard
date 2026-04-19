import { alpha, createTheme } from '@mui/material/styles'

export const theme = createTheme({
  typography: {
    fontFamily: '"Outfit", "Merriweather Sans", "Lato", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    background: {
      default: '#f6f7f8',
      paper: '#ffffff',
    },
    primary: {
      main: '#21622A',
      light: '#3A9A48',
      dark: '#184a20',
    },
    secondary: {
      main: '#F37326',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
  },
})

export const sidebarActiveBg = alpha(theme.palette.primary.main, 0.12)
