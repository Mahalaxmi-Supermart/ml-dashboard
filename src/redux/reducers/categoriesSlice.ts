import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  CategoriesState,
  Category,
  CategoryUpsertPayload,
} from '../../pages/categories/categoriesTypes'
import { asyncState } from '../../types/common'

const initialState: CategoriesState = {
  categoriesList: asyncState([]),
  selectedCategory: asyncState(null),
  createCategory: asyncState(null),
  updateCategory: asyncState(null),
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchListRequest: (state) => {
      state.categoriesList.pending = true
      state.categoriesList.error = null
    },
    fetchListSuccess: (state, action: PayloadAction<Category[]>) => {
      state.categoriesList.pending = false
      state.categoriesList.data = action.payload
      state.categoriesList.error = null
    },
    fetchListFailure: (state, action: PayloadAction<string>) => {
      state.categoriesList.pending = false
      state.categoriesList.error = action.payload
    },
    clearCategoriesList: (state) => {
      state.categoriesList = asyncState([])
    },

    fetchCategoryRequest: (state, _action: PayloadAction<number>) => {
      state.selectedCategory.pending = true
      state.selectedCategory.error = null
      state.selectedCategory.data = null
    },
    fetchCategorySuccess: (state, action: PayloadAction<Category>) => {
      state.selectedCategory.pending = false
      state.selectedCategory.data = action.payload
      state.selectedCategory.error = null
    },
    fetchCategoryFailure: (state, action: PayloadAction<string>) => {
      state.selectedCategory.pending = false
      state.selectedCategory.error = action.payload
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = asyncState(null)
    },

    createCategoryRequest: (state, _action: PayloadAction<CategoryUpsertPayload>) => {
      state.createCategory.pending = true
      state.createCategory.error = null
      state.createCategory.data = null
    },
    createCategorySuccess: (state, action: PayloadAction<Category>) => {
      state.createCategory.pending = false
      state.createCategory.data = action.payload
      state.createCategory.error = null
    },
    createCategoryFailure: (state, action: PayloadAction<string>) => {
      state.createCategory.pending = false
      state.createCategory.error = action.payload
    },
    clearCreateCategory: (state) => {
      state.createCategory = asyncState(null)
    },

    updateCategoryRequest: (
      state,
      _action: PayloadAction<{ id: number; body: CategoryUpsertPayload }>,
    ) => {
      state.updateCategory.pending = true
      state.updateCategory.error = null
      state.updateCategory.data = null
    },
    updateCategorySuccess: (state, action: PayloadAction<Category>) => {
      state.updateCategory.pending = false
      state.updateCategory.data = action.payload
      state.updateCategory.error = null
    },
    updateCategoryFailure: (state, action: PayloadAction<string>) => {
      state.updateCategory.pending = false
      state.updateCategory.error = action.payload
    },
    clearUpdateCategory: (state) => {
      state.updateCategory = asyncState(null)
    },
  },
})

export const {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  clearCategoriesList,
  fetchCategoryRequest,
  fetchCategorySuccess,
  fetchCategoryFailure,
  clearSelectedCategory,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  clearCreateCategory,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryFailure,
  clearUpdateCategory,
} = categoriesSlice.actions
export default categoriesSlice.reducer
