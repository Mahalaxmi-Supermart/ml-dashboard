import type { AsyncState } from '../../types/common'
import type { BaseListQuery } from '../../types/listQuery'

export interface Customer {
  id: number
  name: string
  email_id: string
  phone_number: string
  is_email_verified: boolean
  is_phone_verified: boolean
  status: number
  deleted: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CustomerListQuery extends BaseListQuery {
  // Add customer-specific filters here if needed
}

export const defaultCustomerListQuery: CustomerListQuery = {
  page_no: 1,
  page_size: 10,
  sort_by: 'created_at',
  sort_order: 'desc',
}

export interface CustomersState {
  lastQuery: CustomerListQuery
  customersList: AsyncState<Customer[]>
  customersCount: AsyncState<number>
  selectedCustomer: AsyncState<Customer | null>
}
