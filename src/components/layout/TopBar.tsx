import Logout from '@mui/icons-material/Logout'
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useAppDispatch } from '../../hooks/reduxHooks'
import { logout } from '../../redux/reducers/authSlice'
import { config } from '../../config'

export function TopBar() {
  const dispatch = useAppDispatch()
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const profileMenuOpen = Boolean(profileAnchor)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileAnchor(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    dispatch(logout())
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 64, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.4 }}
        >
          MAHALAXMI
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton aria-label="notifications" color="inherit" size="medium">
          <Badge badgeContent={4} color="error" max={99}>
            <NotificationsNoneOutlined />
          </Badge>
        </IconButton>
        <IconButton
          onClick={handleProfileClick}
          size="small"
          aria-label="open profile menu"
          aria-controls={profileMenuOpen ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={profileMenuOpen ? 'true' : undefined}
          sx={{ p: 0 }}
        >
          <Avatar src={config.topbarAvatarUrl} alt="Profile" sx={{ width: 40, height: 40 }} />
        </IconButton>
        <Menu
          id="profile-menu"
          anchorEl={profileAnchor}
          open={profileMenuOpen}
          onClose={handleProfileMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { mt: 1, minWidth: 180 },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Log out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
