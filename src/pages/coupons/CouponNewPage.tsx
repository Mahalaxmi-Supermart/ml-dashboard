import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  clearCreateCoupon,
  createCouponRequest,
  fetchPageRequest,
} from '../../redux/reducers/couponsSlice'
import { CouponForm } from './components/CouponForm'
import type { CouponFormValues } from './couponsTypes'

export function CouponNewPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const create = useAppSelector((s) => s.coupons.createCoupon)
  const lastQuery = useAppSelector((s) => s.coupons.lastQuery)

  useEffect(() => {
    dispatch(clearCreateCoupon())
  }, [dispatch])

  useEffect(() => {
    if (create.data && !create.pending) {
      navigate('/coupons', { replace: true })
      dispatch(clearCreateCoupon())
      dispatch(fetchPageRequest(lastQuery))
    }
  }, [create.data, create.pending, navigate, dispatch, lastQuery])

  const handleSubmit = (values: Partial<CouponFormValues>) => {
    dispatch(createCouponRequest(values as CouponFormValues))
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Add coupon
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/coupons" underline="hover" color="inherit">
          Coupons
        </Link>
        <Typography color="text.primary">New</Typography>
      </Breadcrumbs>

      <CouponForm
        heroTitle="New coupon"
        heroDescription="Create a coupon with code, name, and discount details. You can set usage limits and validity periods."
        onSubmit={handleSubmit}
        loading={create.pending}
      />
    </Box>
  )
}
