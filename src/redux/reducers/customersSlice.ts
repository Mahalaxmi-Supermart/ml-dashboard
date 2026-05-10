import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  defaultCustomerListQuery,
  type Customer,
  type CustomerListQuery,
  type CustomersState,
} from '../../pages/customers/customersTypes'
import { asyncState } from '../../types/common'

const initialState: CustomersState = {
  lastQuery: defaultCustomerListQuery,
  customersList: asyncState([]),
  customersCount: asyncState(0),
  selectedCustomer: asyncState(null),
}

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    fetchPageRequest: (state, action: PayloadAction<CustomerListQuery>) => {
      state.lastQuery = action.payload
      state.customersList.pending = true
      state.customersList.error = null
      state.customersCount.pending = true
      state.customersCount.error = null
    },
    fetchListSuccess: (state, action: PayloadAction<Customer[]>) => {
      state.customersList.pending = false
      state.customersList.data = action.payload
      state.customersList.error = null
    },
    fetchListFailure: (state, action: PayloadAction<string>) => {
      state.customersList.pending = false
      state.customersList.error = action.payload
    },
    fetchCountSuccess: (state, action: PayloadAction<number>) => {
      state.customersCount.pending = false
      state.customersCount.data = action.payload
      state.customersCount.error = null
    },
    fetchCountFailure: (state, action: PayloadAction<string>) => {
      state.customersCount.pending = false
      state.customersCount.error = action.payload
    },
    clearCustomersList: (state) => {
      state.lastQuery = defaultCustomerListQuery
      state.customersList = asyncState([])
      state.customersCount = asyncState(0)
    },
    fetchDetailRequest: (state, _action: PayloadAction<number>) => {
      state.selectedCustomer.pending = true
      state.selectedCustomer.error = null
    },
    fetchDetailSuccess: (state, action: PayloadAction<Customer>) => {
      state.selectedCustomer.pending = false
      state.selectedCustomer.data = action.payload
      state.selectedCustomer.error = null
    },
    fetchDetailFailure: (state, action: PayloadAction<string>) => {
      state.selectedCustomer.pending = false
      state.selectedCustomer.error = action.payload
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = asyncState(null)
    },
  },
})

export const {
  fetchPageRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchCountSuccess,
  fetchCountFailure,
  clearCustomersList,
  fetchDetailRequest,
  fetchDetailSuccess,
  fetchDetailFailure,
  clearSelectedCustomer,
} = customersSlice.actions

export default customersSlice.reducer
