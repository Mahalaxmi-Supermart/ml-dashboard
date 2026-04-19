import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import type { CategoryUpsertPayload } from '../../pages/categories/categoriesTypes'
import {
  createCategoryFailure,
  createCategoryRequest,
  createCategorySuccess,
  fetchCategoryFailure,
  fetchCategoryRequest,
  fetchCategorySuccess,
  fetchListFailure,
  fetchListRequest,
  fetchListSuccess,
  updateCategoryFailure,
  updateCategoryRequest,
  updateCategorySuccess,
} from '../reducers/categoriesSlice'
import {
  createCategory,
  fetchCategoriesList,
  fetchCategoryById,
  updateCategory,
} from '../services/categoriesService'

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

function* fetchListWorker() {
  try {
    const rows: Awaited<ReturnType<typeof fetchCategoriesList>> = yield call(fetchCategoriesList)
    yield put(fetchListSuccess(rows))
  } catch (err: unknown) {
    yield put(fetchListFailure(getErrorMessage(err)))
  }
}

function* fetchCategoryWorker(action: PayloadAction<number>) {
  try {
    const row: Awaited<ReturnType<typeof fetchCategoryById>> = yield call(
      fetchCategoryById,
      action.payload,
    )
    yield put(fetchCategorySuccess(row))
  } catch (err: unknown) {
    yield put(fetchCategoryFailure(getErrorMessage(err)))
  }
}

function* createCategoryWorker(action: PayloadAction<CategoryUpsertPayload>) {
  try {
    const row: Awaited<ReturnType<typeof createCategory>> = yield call(
      createCategory,
      action.payload,
    )
    yield put(createCategorySuccess(row))
  } catch (err: unknown) {
    yield put(createCategoryFailure(getErrorMessage(err)))
  }
}

function* updateCategoryWorker(
  action: PayloadAction<{ id: number; body: CategoryUpsertPayload }>,
) {
  try {
    const { id, body } = action.payload
    const row: Awaited<ReturnType<typeof updateCategory>> = yield call(updateCategory, id, body)
    yield put(updateCategorySuccess(row))
  } catch (err: unknown) {
    yield put(updateCategoryFailure(getErrorMessage(err)))
  }
}

export function* categoriesWatcher() {
  yield takeLatest(fetchListRequest.type, fetchListWorker)
  yield takeLatest(fetchCategoryRequest.type, fetchCategoryWorker)
  yield takeLatest(createCategoryRequest.type, createCategoryWorker)
  yield takeLatest(updateCategoryRequest.type, updateCategoryWorker)
}
