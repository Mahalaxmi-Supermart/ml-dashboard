import CategoryOutlined from '@mui/icons-material/CategoryOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined'
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined'
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import EmailOutlined from '@mui/icons-material/EmailOutlined'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { sidebarActiveBg } from '../../theme/theme'

const DRAWER_WIDTH = 264

const itemSx = {
  borderRadius: 2,
  mb: 0.5,
  color: 'text.secondary',
  pl: 2,
  py: 1.25,
  '& .MuiListItemIcon-root': {
    color: 'inherit',
    minWidth: 40,
  },
  '&.Mui-selected': {
    bgcolor: sidebarActiveBg,
    color: 'primary.main',
    fontWeight: 600,
    '&:hover': {
      bgcolor: sidebarActiveBg,
    },
    '& .MuiListItemIcon-root': {
      color: 'primary.main',
    },
  },
} as const

export function Sidebar() {
  const { pathname } = useLocation()
  const productsSelected = pathname.startsWith('/products')
  const categoriesSelected = pathname.startsWith('/categories')
  const ordersSelected = pathname.startsWith('/orders')
  const couponsSelected = pathname.startsWith('/coupons')
  const membersSelected = pathname.startsWith('/members')
  const invitesSelected = pathname.startsWith('/invites')
  const customersSelected = pathname.startsWith('/customers')

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        },
      }}
    >
      <Toolbar sx={{ minHeight: 64 }} />
      <List sx={{ px: 1.5, pt: 1 }}>
        <ListItemButton
          component={RouterLink}
          to="/products"
          selected={productsSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <Inventory2Outlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Products" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/categories"
          selected={categoriesSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <CategoryOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Categories" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/orders"
          selected={ordersSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <ShoppingBagOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Orders" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/coupons"
          selected={couponsSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <ConfirmationNumberOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Coupons" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/members"
          selected={membersSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <PeopleOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delivery Partners" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/invites"
          selected={invitesSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <EmailOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Invites" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/customers"
          selected={customersSelected}
          sx={itemSx}
        >
          <ListItemIcon>
            <PersonOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Customers" slotProps={{ primary: { sx: { fontSize: '0.95rem' } } }} />
        </ListItemButton>
      </List>
    </Drawer>
  )
}
