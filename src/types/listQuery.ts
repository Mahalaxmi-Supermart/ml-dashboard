/** Shared list/count query params for dashboard entities (backend contract). */
export type SortOrder = 'asc' | 'desc'

export interface BaseListQuery {
  page_no: number
  page_size: number
  sort_by: string
  sort_order: SortOrder
  status?: number | null
  search?: string | null
  ids?: number[] | null
}
