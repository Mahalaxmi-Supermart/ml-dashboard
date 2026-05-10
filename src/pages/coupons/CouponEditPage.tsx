import { useEffect } from 'react'
import { Box, Breadcrumbs, CircularProgress, Link, Typography } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchCouponDetailRequest, updateCouponRequest } from '../../redux/reducers/couponsSlice'
import { CouponForm } from './components/CouponForm'
import type { CouponFormValues } from './couponsTypes'

export function CouponEditPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { selectedCoupon, updateCoupon } = useAppSelector((state) => state.coupons)

  useEffect(() => {
    if (id) {
      dispatch(fetchCouponDetailRequest(Number.parseInt(id, 10)))
    }
  }, [dispatch, id])

  const handleSubmit = (values: Partial<CouponFormValues>) => {
    if (id) {
      dispatch(updateCouponRequest({ couponId: Number.parseInt(id, 10), body: values as any }))
    }
  }

  if (selectedCoupon.pending && !selectedCoupon.data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (!selectedCoupon.data && !selectedCoupon.pending) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorAlert error="Coupon not found" />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
        Edit coupon
      </Typography>
      <Breadcrumbs
        separator="/"
        aria-label="breadcrumb"
        sx={{
          color: 'text.secondary',
          mb: 5,
          '& .MuiBreadcrumbs-separator': { mx: 1, fontSize: '0.8rem' },
          '& .MuiTypography-root, & .MuiLink-root': { fontSize: '0.85rem', fontWeight: 500 },
        }}
      >
        <Link component={RouterLink} to="/coupons" underline="hover" color="inherit">
          Coupons
        </Link>
        <Typography color="text.secondary">{selectedCoupon.data?.code || 'Edit'}</Typography>
      </Breadcrumbs>

      <ErrorAlert error={selectedCoupon.error || updateCoupon.error} sx={{ mb: 2 }} />

      {selectedCoupon.data && (
        <CouponForm
          heroTitle="Edit coupon"
          heroDescription={`Update details for coupon ${selectedCoupon.data.code}. Changes take effect immediately after saving.`}
          initialValues={selectedCoupon.data as any}
          onSubmit={handleSubmit}
          loading={updateCoupon.pending}
        />
      )}
    </Box>
  )
}
