import type {
  Category,
  CategoryUpsertPayload,
} from '../../pages/categories/categoriesTypes'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function pickString(v: unknown): string | null {
  if (typeof v === 'string') return v
  return null
}

function mapDtoToCategory(raw: unknown, index: number): Category {
  const r = isRecord(raw) ? raw : {}
  const id = typeof r.id === 'number' ? r.id : index
  const accountId = typeof r.account_id === 'number' ? r.account_id : 0
  const name = typeof r.name === 'string' ? r.name : '—'
  const description = typeof r.description === 'string' ? r.description : ''
  const parent =
    r.parent_category_id === null || r.parent_category_id === undefined
      ? null
      : typeof r.parent_category_id === 'number'
        ? r.parent_category_id
        : null
  const displayOrder = typeof r.display_order === 'number' ? r.display_order : 0
  const imageUrl = pickString(r.image_url)
  const status = typeof r.status === 'number' ? r.status : 0
  const deleted = typeof r.deleted === 'number' ? r.deleted : 0
  const createdAt = typeof r.created_at === 'string' ? r.created_at : ''
  const updatedAt = typeof r.updated_at === 'string' ? r.updated_at : ''
  const deletedAt =
    r.deleted_at === null || r.deleted_at === undefined
      ? null
      : typeof r.deleted_at === 'string'
        ? r.deleted_at
        : null

  return {
    id,
    account_id: accountId,
    name,
    description,
    parent_category_id: parent,
    display_order: displayOrder,
    image_url: imageUrl,
    status,
    deleted,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: deletedAt,
  }
}

function normalizeCategoriesResponse(body: unknown): Category[] {
  if (!isRecord(body)) return []
  const data = body.data
  if (!isRecord(data)) return []
  const categories = data.categories
  if (!Array.isArray(categories)) return []
  return categories.map(mapDtoToCategory)
}

export async function fetchCategoriesList(): Promise<Category[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/categories/')
  return normalizeCategoriesResponse(data)
}

function normalizeCategoryMutationResponse(body: unknown): Category {
  if (!isRecord(body)) throw new Error('Invalid response')
  const d = body.data
  if (isRecord(d)) {
    if (d.category !== undefined) return mapDtoToCategory(d.category, 0)
    if (typeof d.id === 'number') return mapDtoToCategory(d, 0)
  }
  throw new Error('Invalid response')
}

function normalizeCategoryFetchResponse(body: unknown): Category | null {
  if (!isRecord(body)) return null
  const d = body.data
  if (!isRecord(d)) return null
  if (d.category !== undefined) return mapDtoToCategory(d.category, 0)
  if (Array.isArray(d.categories) && d.categories[0])
    return mapDtoToCategory(d.categories[0], 0)
  if (typeof d.id === 'number') return mapDtoToCategory(d, 0)
  return null
}

export async function fetchCategoryById(id: number): Promise<Category> {
  const { data } = await dashboardAxiosInstance.get<unknown>(`/categories/${id}/`)
  const c = normalizeCategoryFetchResponse(data)
  if (!c) throw new Error('Category not found')
  return c
}

export async function createCategory(body: CategoryUpsertPayload): Promise<Category> {
  const { data } = await dashboardAxiosInstance.post<unknown>('/categories/', body)
  return normalizeCategoryMutationResponse(data)
}

export async function updateCategory(
  id: number,
  body: CategoryUpsertPayload,
): Promise<Category> {
  const { data } = await dashboardAxiosInstance.put<unknown>(`/categories/${id}`, body)
  return normalizeCategoryMutationResponse(data)
}
