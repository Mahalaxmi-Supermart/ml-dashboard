import type { AsyncState } from '../../types/common'
import type { BaseListQuery } from '../../types/listQuery'

export interface ProductListQuery extends BaseListQuery {
  category_id?: number | null
  filters?: string | null
}

export const defaultProductListQuery: ProductListQuery = {
  page_no: 1,
  page_size: 10,
  sort_by: 'created_at',
  sort_order: 'desc',
  status: null,
  search: null,
  ids: null,
  category_id: null,
  filters: null,
}

export type PublishStatus = 'published' | 'draft'

export interface ProductRow {
  id: string
  /** Present on variant rows: raw variant id from API (for URLs and mutations). */
  variantApiId?: string
  /** Variant listing label from API (`display_name`); optional on parent rows. */
  displayName?: string
  name: string
  brand: string
  /** Resolved on the client from GET /categories when available. */
  category_id: number | null
  category: string
  imageUrl: string | null
  sku: string
  stockCount: number
  stockMax: number
  price: number
  publishStatus: PublishStatus
  /** When set, this row is the parent product; expand to show variant line items. */
  variants?: ProductRow[]
}

/** Payload for POST/PUT parent product (matches dashboard API body). */
export interface ProductUpsertPayload {
  name: string
  description: string
  category_id: number
  brand: string
  is_published: boolean
}

export interface ProductFormValues {
  name: string
  description: string
  /** Select value — stringified category id */
  category_id: string
  brand: string
  enabled: boolean
}

export const emptyProductFormValues: ProductFormValues = {
  name: '',
  description: '',
  category_id: '',
  brand: '',
  enabled: true,
}

export function productFormValuesToPayload(values: ProductFormValues): ProductUpsertPayload {
  const categoryId = Number.parseInt(values.category_id, 10)
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category_id: Number.isNaN(categoryId) ? 0 : categoryId,
    brand: values.brand.trim(),
    is_published: values.enabled,
  }
}

export interface ProductVariantSummary {
  id: string
  displayName: string
  sku: string
  price: number
  stockCount: number
}

/** Parent product returned from GET detail / create / update responses. */
export interface ProductDetail {
  id: string
  name: string
  description: string
  category_id: number
  brand: string
  enabled: boolean
  /** Resolved from API `medias` when present. */
  imageUrl: string | null
  variants: ProductVariantSummary[]
}

export function productDetailToFormValues(detail: ProductDetail): ProductFormValues {
  return {
    name: detail.name,
    description: detail.description,
    category_id: String(detail.category_id),
    brand: detail.brand,
    enabled: detail.enabled,
  }
}

/** Form row for `attributes_json` key/value pairs (e.g. weight, pack size). */
export interface ProductVariantAttributeRow {
  key: string
  value: string
}

/** Catalogue filter row for variant ↔ attribute ↔ value (separate from `attributes_json`). */
export interface VariantFilterAttributeFormRow {
  /** Server map id when editing an existing mapping; null for new rows. */
  mapId: number | null
  attributeId: number | null
  attributeName: string
  attributeValueId: number | null
  value: string
}

export function emptyVariantFilterAttributeRow(): VariantFilterAttributeFormRow {
  return {
    mapId: null,
    attributeId: null,
    attributeName: '',
    attributeValueId: null,
    value: '',
  }
}

/** RHF values for create/update variant. */
export interface ProductVariantFormValues {
  name: string
  description: string
  display_name: string
  sku: string
  barcode: string
  attributes: ProductVariantAttributeRow[]
  unit_of_measurement: string
  unit_number: number
  cost_price: number
  selling_price: number
  /** When true, `cart_allowed_quantity` is sent in the API body; when false, the key is omitted. */
  cart_allowed_quantity_enabled: boolean
  cart_allowed_quantity: number
  quantity: number
}

/** POST/PUT body for `/products/:id/variants/` */
export interface ProductVariantUpsertPayload {
  name: string
  description: string
  display_name: string
  sku: string
  barcode: string
  attributes_json: Record<string, string>
  unit_of_measurement: string
  unit_number: number
  cost_price: number
  selling_price: number
  /** Only present when enforcing a per-cart limit. */
  cart_allowed_quantity?: number
  /** Only sent on create. Omitted on variant update — use inventory adjustment instead. */
  quantity?: number
}

export type VariantInventoryAdjustmentType = 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'

export interface VariantInventoryAdjustmentBody {
  type: VariantInventoryAdjustmentType
  quantity: number
}

/** Variant returned from GET create/update/detail (for edit + post-upload flows). */
export interface ProductVariantDetail {
  id: string
  productId: string
  name: string
  description: string
  display_name: string
  sku: string
  barcode: string
  attributes_json: Record<string, string>
  unit_of_measurement: string
  unit_number: number
  cost_price: number
  selling_price: number
  /** Undefined when API does not set a per-cart limit. */
  cart_allowed_quantity?: number
  /** From `inventory_stock.quantity_available` (sellable / available stock). */
  quantity_available: number
  /** Initial or on-hand style quantity for create form; not the same as `quantity_available` for all APIs. */
  quantity: number
  imageUrls: string[]
}

export function emptyProductVariantFormValues(): ProductVariantFormValues {
  return {
    name: '',
    description: '',
    display_name: '',
    sku: '',
    barcode: '',
    attributes: [{ key: '', value: '' }],
    unit_of_measurement: '',
    unit_number: 0,
    cost_price: 0,
    selling_price: 0,
    cart_allowed_quantity_enabled: false,
    cart_allowed_quantity: 1,
    quantity: 0,
  }
}

function trimAttributeKey(key: string): string {
  return key.trim()
}

export type ProductVariantUpsertPayloadOptions = {
  /** When false (variant edit), `quantity` is omitted from the body. Default true (create). */
  includeQuantity?: boolean
}

/** Builds `attributes_json`; empty keys are skipped. Later rows win on duplicate keys. */
export function productVariantFormValuesToPayload(
  values: ProductVariantFormValues,
  options?: ProductVariantUpsertPayloadOptions,
): ProductVariantUpsertPayload {
  const includeQuantity = options?.includeQuantity !== false
  const attributes_json: Record<string, string> = {}
  for (const row of values.attributes) {
    const k = trimAttributeKey(row.key)
    if (!k) continue
    attributes_json[k] = String(row.value ?? '').trim()
  }

  const payload: ProductVariantUpsertPayload = {
    name: values.name.trim(),
    description: values.description.trim(),
    display_name: values.display_name.trim(),
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    attributes_json,
    unit_of_measurement: values.unit_of_measurement.trim(),
    unit_number: values.unit_number,
    cost_price: values.cost_price,
    selling_price: values.selling_price,
  }
  if (includeQuantity) {
    payload.quantity = values.quantity
  }
  if (values.cart_allowed_quantity_enabled) {
    payload.cart_allowed_quantity = values.cart_allowed_quantity
  }
  return payload
}

export function productVariantDetailToFormValues(
  detail: ProductVariantDetail,
): ProductVariantFormValues {
  const entries = Object.entries(detail.attributes_json ?? {})
  const attributes: ProductVariantAttributeRow[] =
    entries.length > 0
      ? entries.map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]

  const hasCartLimit =
    typeof detail.cart_allowed_quantity === 'number' && !Number.isNaN(detail.cart_allowed_quantity)

  return {
    name: detail.name,
    description: detail.description,
    display_name: detail.display_name,
    sku: detail.sku,
    barcode: detail.barcode,
    attributes,
    unit_of_measurement: detail.unit_of_measurement,
    unit_number: detail.unit_number,
    cost_price: detail.cost_price,
    selling_price: detail.selling_price,
    cart_allowed_quantity_enabled: hasCartLimit,
    cart_allowed_quantity: hasCartLimit ? (detail.cart_allowed_quantity ?? 1) : 1,
    quantity: detail.quantity,
  }
}

export interface ProductsState {
  lastQuery: ProductListQuery
  productsList: AsyncState<ProductRow[]>
  productsCount: AsyncState<number>
  selectedProduct: AsyncState<ProductDetail | null>
  createProduct: AsyncState<ProductDetail | null>
  updateProduct: AsyncState<ProductDetail | null>
  deleteVariant: AsyncState<string | null>
  selectedVariant: AsyncState<ProductVariantDetail | null>
  createVariant: AsyncState<ProductVariantDetail | null>
  updateVariant: AsyncState<ProductVariantDetail | null>
  adjustVariantInventory: AsyncState<null>
}
