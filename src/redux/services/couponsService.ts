import type { Coupon, CouponListQuery } from '../../pages/coupons/couponsTypes'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function normalizeCouponsResponse(body: unknown): Coupon[] {
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.coupons)) {
    return body.data.coupons
  }
  return []
}

function normalizeCountResponse(body: unknown): number {
  if (isRecord(body) && isRecord(body.data)) {
    if (typeof body.data.count === 'number') return body.data.count
    if (typeof body.data.total === 'number') return body.data.total
  }
  // Fallback for sample structure which didn't show count but usually it exists
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.coupons)) {
    return body.data.coupons.length
  }
  return 0
}

export async function fetchCouponsList(query: CouponListQuery): Promise<Coupon[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/coupons/', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
    },
  })
  return normalizeCouponsResponse(data)
}

export async function fetchCouponsCount(query: CouponListQuery): Promise<number> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/coupons/count', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
    },
  })
  return normalizeCountResponse(data)
}

export async function fetchCouponDetail(couponId: number): Promise<Coupon> {
  const { data } = await dashboardAxiosInstance.get<unknown>(`/coupons/${couponId}/`)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.coupon)) {
    return data.data.coupon as unknown as Coupon
  }
  throw new Error('Coupon not found')
}

export async function createCoupon(body: Partial<Coupon>): Promise<Coupon> {
  const payload = {
    ...body,
    discount_value: body.discount_value ? Number(body.discount_value) : 0,
    max_discount_amount: body.max_discount_amount ? Number(body.max_discount_amount) : 0,
    min_cart_value: body.min_cart_value ? Number(body.min_cart_value) : 0,
    valid_from: body.valid_from ? new Date(body.valid_from).toISOString() : null,
    valid_till: body.valid_till ? new Date(body.valid_till).toISOString() : null,
  }
  const { data } = await dashboardAxiosInstance.post<unknown>('/coupons/', payload)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.coupon)) {
    return data.data.coupon as unknown as Coupon
  }
  throw new Error('Failed to create coupon')
}

export async function updateCoupon(couponId: number, body: Partial<Coupon>): Promise<Coupon> {
  const payload: any = { ...body }

  if ('discount_value' in body) payload.discount_value = Number(body.discount_value)
  if ('max_discount_amount' in body) payload.max_discount_amount = Number(body.max_discount_amount)
  if ('min_cart_value' in body) payload.min_cart_value = Number(body.min_cart_value)
  if ('valid_from' in body) payload.valid_from = body.valid_from ? new Date(body.valid_from).toISOString() : null
  if ('valid_till' in body) payload.valid_till = body.valid_till ? new Date(body.valid_till).toISOString() : null

  const { data } = await dashboardAxiosInstance.put<unknown>(`/coupons/${couponId}`, payload)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.coupon)) {
    return data.data.coupon as unknown as Coupon
  }
  return fetchCouponDetail(couponId)
}

export async function deleteCoupon(couponId: number): Promise<void> {
  await dashboardAxiosInstance.delete(`/coupons/${couponId}`)
}
