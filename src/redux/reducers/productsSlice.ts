import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  defaultProductListQuery,
  type ProductDetail,
  type ProductListQuery,
  type ProductRow,
  type ProductUpsertPayload,
  type ProductVariantDetail,
  type ProductVariantUpsertPayload,
  type ProductsState,
  type VariantInventoryAdjustmentBody,
} from '../../pages/products/productsTypes'
import { asyncState } from '../../types/common'

const initialState: ProductsState = {
  lastQuery: defaultProductListQuery,
  productsList: asyncState([]),
  productsCount: asyncState(0),
  selectedProduct: asyncState(null),
  createProduct: asyncState(null),
  updateProduct: asyncState(null),
  deleteVariant: asyncState(null),
  selectedVariant: asyncState(null),
  createVariant: asyncState(null),
  updateVariant: asyncState(null),
  adjustVariantInventory: asyncState(null),
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchPageRequest: (state, action: PayloadAction<ProductListQuery>) => {
      state.lastQuery = action.payload
      state.productsList.pending = true
      state.productsList.error = null
      state.productsCount.pending = true
      state.productsCount.error = null
    },
    fetchListSuccess: (state, action: PayloadAction<ProductRow[]>) => {
      state.productsList.pending = false
      state.productsList.data = action.payload
      state.productsList.error = null
    },
    fetchListFailure: (state, action: PayloadAction<string>) => {
      state.productsList.pending = false
      state.productsList.error = action.payload
    },
    fetchCountSuccess: (state, action: PayloadAction<number>) => {
      state.productsCount.pending = false
      state.productsCount.data = action.payload
      state.productsCount.error = null
    },
    fetchCountFailure: (state, action: PayloadAction<string>) => {
      state.productsCount.pending = false
      state.productsCount.error = action.payload
    },
    clearProductsList: (state) => {
      state.lastQuery = defaultProductListQuery
      state.productsList = asyncState([])
      state.productsCount = asyncState(0)
    },

    fetchProductDetailRequest: (state, _action: PayloadAction<string>) => {
      state.selectedProduct.pending = true
      state.selectedProduct.error = null
      state.selectedProduct.data = null
    },
    fetchProductDetailSuccess: (state, action: PayloadAction<ProductDetail>) => {
      state.selectedProduct.pending = false
      state.selectedProduct.data = action.payload
      state.selectedProduct.error = null
    },
    fetchProductDetailFailure: (state, action: PayloadAction<string>) => {
      state.selectedProduct.pending = false
      state.selectedProduct.error = action.payload
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = asyncState(null)
    },

    createProductRequest: (state, _action: PayloadAction<ProductUpsertPayload>) => {
      state.createProduct.pending = true
      state.createProduct.error = null
      state.createProduct.data = null
    },
    createProductSuccess: (state, action: PayloadAction<ProductDetail>) => {
      state.createProduct.pending = false
      state.createProduct.data = action.payload
      state.createProduct.error = null
    },
    createProductFailure: (state, action: PayloadAction<string>) => {
      state.createProduct.pending = false
      state.createProduct.error = action.payload
    },
    clearCreateProduct: (state) => {
      state.createProduct = asyncState(null)
    },

    updateProductRequest: (
      state,
      _action: PayloadAction<{ productId: string; body: ProductUpsertPayload }>,
    ) => {
      state.updateProduct.pending = true
      state.updateProduct.error = null
      state.updateProduct.data = null
    },
    updateProductSuccess: (state, action: PayloadAction<ProductDetail>) => {
      state.updateProduct.pending = false
      state.updateProduct.data = action.payload
      state.updateProduct.error = null
      if (state.selectedProduct.data?.id === action.payload.id) {
        state.selectedProduct.data = action.payload
        state.selectedProduct.pending = false
        state.selectedProduct.error = null
      }
    },
    updateProductFailure: (state, action: PayloadAction<string>) => {
      state.updateProduct.pending = false
      state.updateProduct.error = action.payload
    },
    clearUpdateProduct: (state) => {
      state.updateProduct = asyncState(null)
    },

    deleteVariantRequest: (
      state,
      _action: PayloadAction<{ productId: string; variantId: string }>,
    ) => {
      state.deleteVariant.pending = true
      state.deleteVariant.error = null
      state.deleteVariant.data = null
    },
    deleteVariantSuccess: (state, action: PayloadAction<string>) => {
      state.deleteVariant.pending = false
      state.deleteVariant.data = action.payload
      state.deleteVariant.error = null
    },
    deleteVariantFailure: (state, action: PayloadAction<string>) => {
      state.deleteVariant.pending = false
      state.deleteVariant.error = action.payload
    },
    clearDeleteVariant: (state) => {
      state.deleteVariant = asyncState(null)
    },

    fetchVariantDetailRequest: (
      state,
      _action: PayloadAction<{ productId: string; variantId: string }>,
    ) => {
      state.selectedVariant.pending = true
      state.selectedVariant.error = null
      state.selectedVariant.data = null
    },
    fetchVariantDetailSuccess: (state, action: PayloadAction<ProductVariantDetail>) => {
      state.selectedVariant.pending = false
      state.selectedVariant.data = action.payload
      state.selectedVariant.error = null
    },
    fetchVariantDetailFailure: (state, action: PayloadAction<string>) => {
      state.selectedVariant.pending = false
      state.selectedVariant.error = action.payload
    },
    clearSelectedVariant: (state) => {
      state.selectedVariant = asyncState(null)
    },

    createVariantRequest: (
      state,
      _action: PayloadAction<{ productId: string; body: ProductVariantUpsertPayload }>,
    ) => {
      state.createVariant.pending = true
      state.createVariant.error = null
      state.createVariant.data = null
    },
    createVariantSuccess: (state, action: PayloadAction<ProductVariantDetail>) => {
      state.createVariant.pending = false
      state.createVariant.data = action.payload
      state.createVariant.error = null
    },
    createVariantFailure: (state, action: PayloadAction<string>) => {
      state.createVariant.pending = false
      state.createVariant.error = action.payload
    },
    clearCreateVariant: (state) => {
      state.createVariant = asyncState(null)
    },

    updateVariantRequest: (
      state,
      _action: PayloadAction<{
        productId: string
        variantId: string
        body: ProductVariantUpsertPayload
      }>,
    ) => {
      state.updateVariant.pending = true
      state.updateVariant.error = null
      state.updateVariant.data = null
    },
    updateVariantSuccess: (state, action: PayloadAction<ProductVariantDetail>) => {
      state.updateVariant.pending = false
      state.updateVariant.data = action.payload
      state.updateVariant.error = null
      if (
        state.selectedVariant.data?.id === action.payload.id &&
        state.selectedVariant.data?.productId === action.payload.productId
      ) {
        state.selectedVariant.data = action.payload
        state.selectedVariant.pending = false
        state.selectedVariant.error = null
      }
    },
    updateVariantFailure: (state, action: PayloadAction<string>) => {
      state.updateVariant.pending = false
      state.updateVariant.error = action.payload
    },
    clearUpdateVariant: (state) => {
      state.updateVariant = asyncState(null)
    },

    adjustVariantInventoryRequest: (
      state,
      _action: PayloadAction<{
        productId: string
        variantId: string
        body: VariantInventoryAdjustmentBody
      }>,
    ) => {
      state.adjustVariantInventory.pending = true
      state.adjustVariantInventory.error = null
    },
    adjustVariantInventorySuccess: (state) => {
      state.adjustVariantInventory.pending = false
      state.adjustVariantInventory.error = null
    },
    adjustVariantInventoryFailure: (state, action: PayloadAction<string>) => {
      state.adjustVariantInventory.pending = false
      state.adjustVariantInventory.error = action.payload
    },
    clearAdjustVariantInventory: (state) => {
      state.adjustVariantInventory = asyncState(null)
    },
  },
})

export const {
  fetchPageRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchCountSuccess,
  fetchCountFailure,
  clearProductsList,
  fetchProductDetailRequest,
  fetchProductDetailSuccess,
  fetchProductDetailFailure,
  clearSelectedProduct,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  clearCreateProduct,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  clearUpdateProduct,
  deleteVariantRequest,
  deleteVariantSuccess,
  deleteVariantFailure,
  clearDeleteVariant,
  fetchVariantDetailRequest,
  fetchVariantDetailSuccess,
  fetchVariantDetailFailure,
  clearSelectedVariant,
  createVariantRequest,
  createVariantSuccess,
  createVariantFailure,
  clearCreateVariant,
  updateVariantRequest,
  updateVariantSuccess,
  updateVariantFailure,
  clearUpdateVariant,
  adjustVariantInventoryRequest,
  adjustVariantInventorySuccess,
  adjustVariantInventoryFailure,
  clearAdjustVariantInventory,
} = productsSlice.actions
export default productsSlice.reducer
