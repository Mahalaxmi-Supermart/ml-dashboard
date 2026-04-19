import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../redux/reducers/authSlice'
import categoriesReducer from '../redux/reducers/categoriesSlice'
import productsReducer from '../redux/reducers/productsSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  products: productsReducer,
})

export type RootReducer = typeof rootReducer
