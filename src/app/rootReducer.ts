import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../redux/reducers/authSlice'
import categoriesReducer from '../redux/reducers/categoriesSlice'
import productsReducer from '../redux/reducers/productsSlice'
import couponsReducer from '../redux/reducers/couponsSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  products: productsReducer,
  coupons: couponsReducer,
})

export type RootReducer = typeof rootReducer
