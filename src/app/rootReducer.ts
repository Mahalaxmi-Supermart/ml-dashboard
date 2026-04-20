import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../redux/reducers/authSlice'
import categoriesReducer from '../redux/reducers/categoriesSlice'
import productsReducer from '../redux/reducers/productsSlice'
import couponsReducer from '../redux/reducers/couponsSlice'
import membersReducer from '../redux/reducers/membersSlice'
import invitesReducer from '../redux/reducers/invitesSlice'
import customersReducer from '../redux/reducers/customersSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  products: productsReducer,
  coupons: couponsReducer,
  members: membersReducer,
  invites: invitesReducer,
  customers: customersReducer,
})

export type RootReducer = typeof rootReducer
