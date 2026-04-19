import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { call, fork, put, takeLatest } from 'redux-saga/effects'
import type {
  ProductListQuery,
  ProductUpsertPayload,
  ProductVariantUpsertPayload,
  VariantInventoryAdjustmentBody,
} from '../../pages/products/productsTypes'
import {
  createProductFailure,
  createProductRequest,
  createProductSuccess,
  createVariantFailure,
  createVariantRequest,
  createVariantSuccess,
  deleteVariantFailure,
  deleteVariantRequest,
  deleteVariantSuccess,
  fetchCountFailure,
  fetchCountSuccess,
  fetchListFailure,
  fetchListSuccess,
  fetchPageRequest,
  fetchProductDetailFailure,
  fetchProductDetailRequest,
  fetchProductDetailSuccess,
  fetchVariantDetailFailure,
  fetchVariantDetailRequest,
  fetchVariantDetailSuccess,
  adjustVariantInventoryFailure,
  adjustVariantInventoryRequest,
  adjustVariantInventorySuccess,
  updateProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateVariantFailure,
  updateVariantRequest,
  updateVariantSuccess,
} from '../reducers/productsSlice'
import {
  adjustProductVariantInventory,
  createProduct,
  createProductVariant,
  deleteProductVariant,
  fetchProductDetail,
  fetchProductVariant,
  fetchProductsCount,
  fetchProductsList,
  updateProduct,
  updateProductVariant,
} from '../services/productsService'

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

function* listWorker(query: ProductListQuery) {
  try {
    const rows: Awaited<ReturnType<typeof fetchProductsList>> = yield call(
      fetchProductsList,
      query,
    )
    yield put(fetchListSuccess(rows))
  } catch (err: unknown) {
    yield put(fetchListFailure(getErrorMessage(err)))
  }
}

function* countWorker(query: ProductListQuery) {
  try {
    const n: Awaited<ReturnType<typeof fetchProductsCount>> = yield call(
      fetchProductsCount,
      query,
    )
    yield put(fetchCountSuccess(n))
  } catch (err: unknown) {
    yield put(fetchCountFailure(getErrorMessage(err)))
  }
}

function* fetchPageWorker(action: PayloadAction<ProductListQuery>) {
  const query = action.payload
  yield fork(listWorker, query)
  yield fork(countWorker, query)
}

function* fetchProductDetailWorker(action: PayloadAction<string>) {
  const productId = action.payload
  try {
    const detail: Awaited<ReturnType<typeof fetchProductDetail>> = yield call(
      fetchProductDetail,
      productId,
    )
    yield put(fetchProductDetailSuccess(detail))
  } catch (err: unknown) {
    yield put(fetchProductDetailFailure(getErrorMessage(err)))
  }
}

function* createProductWorker(action: PayloadAction<ProductUpsertPayload>) {
  try {
    const detail: Awaited<ReturnType<typeof createProduct>> = yield call(
      createProduct,
      action.payload,
    )
    yield put(createProductSuccess(detail))
  } catch (err: unknown) {
    yield put(createProductFailure(getErrorMessage(err)))
  }
}

function* updateProductWorker(
  action: PayloadAction<{ productId: string; body: ProductUpsertPayload }>,
) {
  const { productId, body } = action.payload
  try {
    const detail: Awaited<ReturnType<typeof updateProduct>> = yield call(
      updateProduct,
      productId,
      body,
    )
    yield put(updateProductSuccess(detail))
  } catch (err: unknown) {
    yield put(updateProductFailure(getErrorMessage(err)))
  }
}

function* deleteVariantWorker(
  action: PayloadAction<{ productId: string; variantId: string }>,
) {
  const { productId, variantId } = action.payload
  try {
    yield call(deleteProductVariant, productId, variantId)
    yield put(deleteVariantSuccess(variantId))
    const detail: Awaited<ReturnType<typeof fetchProductDetail>> = yield call(
      fetchProductDetail,
      productId,
    )
    yield put(fetchProductDetailSuccess(detail))
  } catch (err: unknown) {
    yield put(deleteVariantFailure(getErrorMessage(err)))
  }
}

function* fetchVariantDetailWorker(
  action: PayloadAction<{ productId: string; variantId: string }>,
) {
  const { productId, variantId } = action.payload
  try {
    const detail: Awaited<ReturnType<typeof fetchProductVariant>> = yield call(
      fetchProductVariant,
      productId,
      variantId,
    )
    yield put(fetchVariantDetailSuccess(detail))
  } catch (err: unknown) {
    yield put(fetchVariantDetailFailure(getErrorMessage(err)))
  }
}

function* createVariantWorker(
  action: PayloadAction<{ productId: string; body: ProductVariantUpsertPayload }>,
) {
  const { productId, body } = action.payload
  try {
    const detail: Awaited<ReturnType<typeof createProductVariant>> = yield call(
      createProductVariant,
      productId,
      body,
    )
    yield put(createVariantSuccess(detail))
  } catch (err: unknown) {
    yield put(createVariantFailure(getErrorMessage(err)))
  }
}

function* updateVariantWorker(
  action: PayloadAction<{
    productId: string
    variantId: string
    body: ProductVariantUpsertPayload
  }>,
) {
  const { productId, variantId, body } = action.payload
  try {
    const detail: Awaited<ReturnType<typeof updateProductVariant>> = yield call(
      updateProductVariant,
      productId,
      variantId,
      body,
    )
    yield put(updateVariantSuccess(detail))
  } catch (err: unknown) {
    yield put(updateVariantFailure(getErrorMessage(err)))
  }
}

function* adjustVariantInventoryWorker(
  action: PayloadAction<{
    productId: string
    variantId: string
    body: VariantInventoryAdjustmentBody
  }>,
) {
  const { productId, variantId, body } = action.payload
  try {
    yield call(adjustProductVariantInventory, productId, variantId, body)
    const detail: Awaited<ReturnType<typeof fetchProductVariant>> = yield call(
      fetchProductVariant,
      productId,
      variantId,
    )
    yield put(fetchVariantDetailSuccess(detail))
    yield put(adjustVariantInventorySuccess())
  } catch (err: unknown) {
    yield put(adjustVariantInventoryFailure(getErrorMessage(err)))
  }
}

export function* productsWatcher() {
  yield takeLatest(fetchPageRequest.type, fetchPageWorker)
  yield takeLatest(fetchProductDetailRequest.type, fetchProductDetailWorker)
  yield takeLatest(fetchVariantDetailRequest.type, fetchVariantDetailWorker)
  yield takeLatest(createProductRequest.type, createProductWorker)
  yield takeLatest(updateProductRequest.type, updateProductWorker)
  yield takeLatest(createVariantRequest.type, createVariantWorker)
  yield takeLatest(updateVariantRequest.type, updateVariantWorker)
  yield takeLatest(adjustVariantInventoryRequest.type, adjustVariantInventoryWorker)
  yield takeLatest(deleteVariantRequest.type, deleteVariantWorker)
}
