import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  defaultCouponListQuery,
  type Coupon,
  type CouponListQuery,
  type CouponsState,
} from '../../pages/coupons/couponsTypes'
import { asyncState } from '../../types/common'

const initialState: CouponsState = {
  lastQuery: defaultCouponListQuery,
  couponsList: asyncState([]),
  couponsCount: asyncState(0),
  selectedCoupon: asyncState(null),
  createCoupon: asyncState(null),
  updateCoupon: asyncState(null),
  deleteCoupon: asyncState(null),
}

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    fetchPageRequest: (state, action: PayloadAction<CouponListQuery>) => {
      state.lastQuery = action.payload
      state.couponsList.pending = true
      state.couponsList.error = null
      state.couponsCount.pending = true
      state.couponsCount.error = null
    },
    fetchListSuccess: (state, action: PayloadAction<Coupon[]>) => {
      state.couponsList.pending = false
      state.couponsList.data = action.payload
      state.couponsList.error = null
    },
    fetchListFailure: (state, action: PayloadAction<string>) => {
      state.couponsList.pending = false
      state.couponsList.error = action.payload
    },
    fetchCountSuccess: (state, action: PayloadAction<number>) => {
      state.couponsCount.pending = false
      state.couponsCount.data = action.payload
      state.couponsCount.error = null
    },
    fetchCountFailure: (state, action: PayloadAction<string>) => {
      state.couponsCount.pending = false
      state.couponsCount.error = action.payload
    },
    clearCouponsList: (state) => {
      state.lastQuery = defaultCouponListQuery
      state.couponsList = asyncState([])
      state.couponsCount = asyncState(0)
    },

    fetchCouponDetailRequest: (state, _action: PayloadAction<number>) => {
      state.selectedCoupon.pending = true
      state.selectedCoupon.error = null
      state.selectedCoupon.data = null
    },
    fetchCouponDetailSuccess: (state, action: PayloadAction<Coupon>) => {
      state.selectedCoupon.pending = false
      state.selectedCoupon.data = action.payload
      state.selectedCoupon.error = null
    },
    fetchCouponDetailFailure: (state, action: PayloadAction<string>) => {
      state.selectedCoupon.pending = false
      state.selectedCoupon.error = action.payload
    },
    clearSelectedCoupon: (state) => {
      state.selectedCoupon = asyncState(null)
    },

    createCouponRequest: (state, _action: PayloadAction<Partial<Coupon>>) => {
      state.createCoupon.pending = true
      state.createCoupon.error = null
      state.createCoupon.data = null
    },
    createCouponSuccess: (state, action: PayloadAction<Coupon>) => {
      state.createCoupon.pending = false
      state.createCoupon.data = action.payload
      state.createCoupon.error = null
    },
    createCouponFailure: (state, action: PayloadAction<string>) => {
      state.createCoupon.pending = false
      state.createCoupon.error = action.payload
    },
    clearCreateCoupon: (state) => {
      state.createCoupon = asyncState(null)
    },

    updateCouponRequest: (
      state,
      _action: PayloadAction<{ couponId: number; body: Partial<Coupon> }>,
    ) => {
      state.updateCoupon.pending = true
      state.updateCoupon.error = null
      state.updateCoupon.data = null
    },
    updateCouponSuccess: (state, action: PayloadAction<Coupon>) => {
      state.updateCoupon.pending = false
      state.updateCoupon.data = action.payload
      state.updateCoupon.error = null
      if (state.selectedCoupon.data?.id === action.payload.id) {
        state.selectedCoupon.data = action.payload
      }
    },
    updateCouponFailure: (state, action: PayloadAction<string>) => {
      state.updateCoupon.pending = false
      state.updateCoupon.error = action.payload
    },
    clearUpdateCoupon: (state) => {
      state.updateCoupon = asyncState(null)
    },

    deleteCouponRequest: (state, _action: PayloadAction<number>) => {
      state.deleteCoupon.pending = true
      state.deleteCoupon.error = null
      state.deleteCoupon.data = null
    },
    deleteCouponSuccess: (state, action: PayloadAction<number>) => {
      state.deleteCoupon.pending = false
      state.deleteCoupon.data = action.payload
      state.deleteCoupon.error = null
    },
    deleteCouponFailure: (state, action: PayloadAction<string>) => {
      state.deleteCoupon.pending = false
      state.deleteCoupon.error = action.payload
    },
    clearDeleteCoupon: (state) => {
      state.deleteCoupon = asyncState(null)
    },
  },
})

export const {
  fetchPageRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchCountSuccess,
  fetchCountFailure,
  clearCouponsList,
  fetchCouponDetailRequest,
  fetchCouponDetailSuccess,
  fetchCouponDetailFailure,
  clearSelectedCoupon,
  createCouponRequest,
  createCouponSuccess,
  createCouponFailure,
  clearCreateCoupon,
  updateCouponRequest,
  updateCouponSuccess,
  updateCouponFailure,
  clearUpdateCoupon,
  deleteCouponRequest,
  deleteCouponSuccess,
  deleteCouponFailure,
  clearDeleteCoupon,
} = couponsSlice.actions

export default couponsSlice.reducer
