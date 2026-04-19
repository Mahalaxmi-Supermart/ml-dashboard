import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { call, fork, put, takeLatest } from 'redux-saga/effects'
import type { Coupon, CouponListQuery } from '../../pages/coupons/couponsTypes'
import {
  createCouponFailure,
  createCouponRequest,
  createCouponSuccess,
  deleteCouponFailure,
  deleteCouponRequest,
  deleteCouponSuccess,
  fetchCountFailure,
  fetchCountSuccess,
  fetchCouponDetailFailure,
  fetchCouponDetailRequest,
  fetchCouponDetailSuccess,
  fetchListFailure,
  fetchListSuccess,
  fetchPageRequest,
  updateCouponFailure,
  updateCouponRequest,
  updateCouponSuccess,
} from '../reducers/couponsSlice'
import {
  createCoupon,
  deleteCoupon,
  fetchCouponDetail,
  fetchCouponsCount,
  fetchCouponsList,
  updateCoupon,
} from '../services/couponsService'

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (typeof data?.message === 'string' && data.message) return data.message
    if (typeof data?.error === 'string' && data.error) return data.error
    return err.message ?? 'Request failed'
  }
  if (err instanceof Error) return err.message
  return 'Request failed'
}

function* listWorker(query: CouponListQuery) {
  try {
    const rows: Awaited<ReturnType<typeof fetchCouponsList>> = yield call(fetchCouponsList, query)
    yield put(fetchListSuccess(rows))
  } catch (err: unknown) {
    yield put(fetchListFailure(getErrorMessage(err)))
  }
}

function* countWorker(query: CouponListQuery) {
  try {
    const n: Awaited<ReturnType<typeof fetchCouponsCount>> = yield call(fetchCouponsCount, query)
    yield put(fetchCountSuccess(n))
  } catch (err: unknown) {
    yield put(fetchCountFailure(getErrorMessage(err)))
  }
}

function* fetchPageWorker(action: PayloadAction<CouponListQuery>) {
  const query = action.payload
  yield fork(listWorker, query)
  yield fork(countWorker, query)
}

function* fetchCouponDetailWorker(action: PayloadAction<number>) {
  try {
    const detail: Awaited<ReturnType<typeof fetchCouponDetail>> = yield call(
      fetchCouponDetail,
      action.payload,
    )
    yield put(fetchCouponDetailSuccess(detail))
  } catch (err: unknown) {
    yield put(fetchCouponDetailFailure(getErrorMessage(err)))
  }
}

function* createCouponWorker(action: PayloadAction<Partial<Coupon>>) {
  try {
    const detail: Awaited<ReturnType<typeof createCoupon>> = yield call(createCoupon, action.payload)
    yield put(createCouponSuccess(detail))
  } catch (err: unknown) {
    yield put(createCouponFailure(getErrorMessage(err)))
  }
}

function* updateCouponWorker(action: PayloadAction<{ couponId: number; body: Partial<Coupon> }>) {
  try {
    const { couponId, body } = action.payload
    const detail: Awaited<ReturnType<typeof updateCoupon>> = yield call(updateCoupon, couponId, body)
    yield put(updateCouponSuccess(detail))
  } catch (err: unknown) {
    yield put(updateCouponFailure(getErrorMessage(err)))
  }
}

function* deleteCouponWorker(action: PayloadAction<number>) {
  try {
    yield call(deleteCoupon, action.payload)
    yield put(deleteCouponSuccess(action.payload))
  } catch (err: unknown) {
    yield put(deleteCouponFailure(getErrorMessage(err)))
  }
}

export function* couponsWatcher() {
  yield takeLatest(fetchPageRequest.type, fetchPageWorker)
  yield takeLatest(fetchCouponDetailRequest.type, fetchCouponDetailWorker)
  yield takeLatest(createCouponRequest.type, createCouponWorker)
  yield takeLatest(updateCouponRequest.type, updateCouponWorker)
  yield takeLatest(deleteCouponRequest.type, deleteCouponWorker)
}
