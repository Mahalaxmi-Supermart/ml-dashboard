import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'
import type { Customer, CustomerListQuery } from '../../pages/customers/customersTypes'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function normalizeCustomersResponse(body: unknown): Customer[] {
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.customers)) {
    return body.data.customers
  }
  return []
}

function normalizeCountResponse(body: unknown): number {
  if (isRecord(body) && isRecord(body.data)) {
    if (typeof body.data.count === 'number') return body.data.count
    if (typeof body.data.total === 'number') return body.data.total
  }
  return 0
}

function normalizeCustomerResponse(body: unknown): Customer | null {
  if (isRecord(body) && isRecord(body.data) && isRecord(body.data.customer)) {
    return body.data.customer as unknown as Customer
  }
  return null
}

export async function fetchCustomersList(query: CustomerListQuery): Promise<Customer[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/customers/', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
    },
  })
  return normalizeCustomersResponse(data)
}

export async function fetchCustomersCount(query: CustomerListQuery): Promise<number> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/customers/count', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
    },
  })
  return normalizeCountResponse(data)
}

export async function fetchCustomerDetail(id: number): Promise<Customer | null> {
  const { data } = await dashboardAxiosInstance.get<unknown>(`/customers/${id}/`)
  return normalizeCustomerResponse(data)
}
