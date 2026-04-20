import { useEffect } from 'react'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchDetailRequest, clearSelectedCustomer } from '../../redux/reducers/customersSlice'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selectedCustomer } = useAppSelector((state) => state.customers)

  useEffect(() => {
    if (id) {
      dispatch(fetchDetailRequest(Number.parseInt(id, 10)))
    }
    return () => {
      dispatch(clearSelectedCustomer())
    }
  }, [id, dispatch])

  const customer = selectedCustomer.data
  const loading = selectedCustomer.pending

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customers')}
            sx={{ color: 'text.secondary', ml: -1 }}
          >
            Back to List
          </Button>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Customer Details
        </Typography>
        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/customers" underline="hover" color="inherit">
            Customers
          </Link>
          <Typography color="text.primary">#{id}</Typography>
        </Breadcrumbs>
      </Stack>

      {loading ? (
        <Card sx={{ p: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Card>
      ) : customer ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                General Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Customer ID
                  </Typography>
                  <Typography variant="body1">#{customer.id}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">{customer.email_id}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">{customer.phone_number || '-'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Account Verification
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Email Verification
                    </Typography>
                    <Chip
                      label={customer.is_email_verified ? 'Verified' : 'Pending'}
                      color={customer.is_email_verified ? 'success' : 'warning'}
                      sx={{ width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Phone Verification
                    </Typography>
                    <Chip
                      label={customer.is_phone_verified ? 'Verified' : 'Pending'}
                      color={customer.is_phone_verified ? 'success' : 'warning'}
                      sx={{ width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={customer.status === 1 ? 'Active' : 'Inactive'}
                      color={customer.status === 1 ? 'success' : 'default'}
                      sx={{ width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Timeline
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(customer.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(customer.updated_at).toLocaleString()}
                  </Typography>
                </Box>
                {customer.deleted_at && (
                  <Box>
                    <Typography variant="caption" color="error">
                      Deleted At
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {new Date(customer.deleted_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {selectedCustomer.error || 'Customer not found'}
          </Typography>
        </Card>
      )}
    </Stack>
  )
}
