import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../redux/reducers/authSlice'
import categoriesReducer from '../redux/reducers/categoriesSlice'
import productsReducer from '../redux/reducers/productsSlice'
import couponsReducer from '../redux/reducers/couponsSlice'
import membersReducer from '../redux/reducers/membersSlice'
import invitesReducer from '../redux/reducers/invitesSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  products: productsReducer,
  coupons: couponsReducer,
  members: membersReducer,
  invites: invitesReducer,
})

export type RootReducer = typeof rootReducer
