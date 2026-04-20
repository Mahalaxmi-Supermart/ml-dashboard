import type { AsyncState } from '../../types/common'
import type { BaseListQuery } from '../../types/listQuery'

export interface CouponListQuery extends BaseListQuery {
  status?: number | null
}

export const defaultCouponListQuery: CouponListQuery = {
  page_no: 1,
  page_size: 10,
  sort_by: 'created_at',
  sort_order: 'desc',
  status: null,
  search: null,
}

export interface Coupon {
  id: number
  account_id: number
  code: string
  name: string
  description: string
  discount_type: string
  discount_value: string
  max_discount_amount: string
  min_cart_value: string
  max_uses: number
  max_uses_per_customer: number
  valid_from: string
  valid_till: string
  status: number
  deleted: number
  created_at: string
  updated_at: string
  deleted_at: string
}

export interface CouponFormValues {
  code: string
  name: string
  description: string
  discount_type: string
  discount_value: string
  max_discount_amount: string
  min_cart_value: string
  max_uses: number
  max_uses_per_customer: number
  valid_from: string | null
  valid_till: string | null
  status: number
}

export const defaultCouponFormValues: CouponFormValues = {
  code: '',
  name: '',
  description: '',
  discount_type: 'PERCENTAGE',
  discount_value: '0',
  max_discount_amount: '0',
  min_cart_value: '0',
  max_uses: 0,
  max_uses_per_customer: 0,
  valid_from: null,
  valid_till: null,
  status: 1,
}

export interface CouponsState {
  lastQuery: CouponListQuery
  couponsList: AsyncState<Coupon[]>
  couponsCount: AsyncState<number>
  selectedCoupon: AsyncState<Coupon | null>
  createCoupon: AsyncState<Coupon | null>
  updateCoupon: AsyncState<Coupon | null>
  deleteCoupon: AsyncState<number | null>
}
