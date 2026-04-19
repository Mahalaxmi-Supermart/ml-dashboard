import type { AsyncState } from '../../types/common'

/** Form + API body for create / update category */
export interface CategoryUpsertPayload {
  name: string
  description: string
  display_order: number
  image_url: string
}

export interface CategoryFormValues {
  name: string
  description: string
  /** String for controlled inputs; parsed on submit */
  display_order: string
  image_url: string
}

export const emptyCategoryFormValues: CategoryFormValues = {
  name: '',
  description: '',
  display_order: '1',
  image_url: '',
}

export function categoryFormValuesToPayload(values: CategoryFormValues): CategoryUpsertPayload {
  const displayOrder = Number.parseInt(values.display_order, 10)
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    display_order: Number.isNaN(displayOrder) ? 0 : displayOrder,
    image_url: values.image_url.trim(),
  }
}

/** Shape returned by `GET /categories/` */
export interface Category {
  id: number
  account_id: number
  name: string
  description: string
  parent_category_id: number | null
  display_order: number
  image_url: string | null
  status: number
  deleted: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CategoriesState {
  categoriesList: AsyncState<Category[]>
  selectedCategory: AsyncState<Category | null>
  createCategory: AsyncState<Category | null>
  updateCategory: AsyncState<Category | null>
}
