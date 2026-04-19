import type {
  ProductDetail,
  ProductListQuery,
  ProductUpsertPayload,
  ProductVariantDetail,
  ProductVariantSummary,
  ProductVariantUpsertPayload,
  ProductRow,
  PublishStatus,
  VariantInventoryAdjustmentBody,
} from '../../pages/products/productsTypes'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function toNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number.parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function resolveCategoryId(entity: Record<string, unknown>): number | null {
  const n = toNumber(entity.category_id ?? entity.categoryId)
  return n >= 1 ? n : null
}

function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c !== '') return c
  }
  return undefined
}

/** First image from `medias[]` (GET /products); prefers thumbnail when present. */
function firstMediaUrl(entity: Record<string, unknown>): string | undefined {
  const medias = entity.medias
  if (!Array.isArray(medias) || medias.length === 0) return undefined
  const m0 = medias[0]
  if (!isRecord(m0)) return undefined
  return pickString(
    m0.thumbnail_url,
    m0.thumbnailUrl,
    m0.url,
    m0.image_url,
    m0.imageUrl,
  )
}

/** All image URLs from `medias[]` on a product or variant. */
function allMediaUrls(entity: Record<string, unknown>): string[] {
  const medias = entity.medias
  if (!Array.isArray(medias) || medias.length === 0) return []
  const urls: string[] = []
  for (const m of medias) {
    if (!isRecord(m)) continue
    const url = pickString(
      m.thumbnail_url,
      m.thumbnailUrl,
      m.url,
      m.image_url,
      m.imageUrl,
    )
    if (url) urls.push(url)
  }
  return urls
}

/** Build GET query object; omits optional fields when unset (backend defaults apply). */
function buildProductQueryParams(
  q: ProductListQuery,
): Record<string, string | number | number[]> {
  const o: Record<string, string | number | number[]> = {
    page_no: q.page_no,
    page_size: q.page_size,
    sort_by: q.sort_by,
    sort_order: q.sort_order,
  }
  if (q.status !== undefined && q.status !== null) o.status = q.status
  const search = q.search?.trim()
  if (search && search.length >= 3) o.search = search
  if (q.ids?.length) o.ids = q.ids
  if (q.category_id != null && q.category_id >= 1) o.category_id = q.category_id
  if (q.filters != null && q.filters !== '') o.filters = q.filters
  return o
}

/** API uses numeric status (1 = active / published). */
function resolvePublishStatusFromEntity(r: Record<string, unknown>): PublishStatus {
  const status = r.status ?? r.publish_status ?? r.publishStatus
  const published = r.is_published ?? r.published ?? r.isPublished
  if (published === true) return 'published'
  if (published === false) return 'draft'
  if (status === 1 || status === '1') return 'published'
  if (status === 0 || status === '0') return 'draft'
  if (typeof status === 'string') {
    const s = status.toLowerCase()
    if (s === 'published' || s === 'active' || s === 'live') return 'published'
    if (s === 'draft' || s === 'inactive') return 'draft'
  }
  return 'draft'
}

function mapDtoToProduct(raw: unknown, index: number): ProductRow {
  const r = isRecord(raw) ? raw : {}
  const id = String(r.id ?? r.product_id ?? r.uuid ?? `row-${index}`)
  const name = String(r.name ?? r.title ?? r.product_name ?? 'Untitled')
  const brand =
    pickString(r.brand, r.brand_name, r.brandName, r.manufacturer) ?? ''
  const category_id = resolveCategoryId(r)
  const category = String(
    r.category ?? r.category_name ?? r.categoryName ?? r.type ?? '—',
  )
  const imageUrl =
    pickString(
      firstMediaUrl(r),
      r.image_url,
      r.imageUrl,
      r.thumbnail,
      r.thumbnail_url,
      r.thumbnailUrl,
      r.image,
    ) ?? null
  const sku =
    pickString(
      r.sku,
      r.SKU,
      r.product_sku,
      r.productSku,
      r.stock_keeping_unit,
      r.stockKeepingUnit,
    ) ?? '—'
  const stockCount = toNumber(r.stock ?? r.quantity ?? r.stock_quantity ?? r.in_stock)
  const stockMaxRaw = toNumber(r.max_stock ?? r.stock_max ?? r.stock_capacity ?? r.maxStock)
  const stockMax = stockMaxRaw > 0 ? stockMaxRaw : Math.max(stockCount, 1)
  const price = toNumber(r.price ?? r.amount ?? r.selling_price ?? r.sellingPrice)
  return {
    id,
    name,
    brand,
    category_id,
    category,
    imageUrl,
    sku,
    stockCount,
    stockMax,
    price,
    publishStatus: resolvePublishStatusFromEntity(r),
  }
}

function mapVariantToRow(
  product: Record<string, unknown>,
  variantRaw: unknown,
  variantIndex: number,
): ProductRow | null {
  const v = isRecord(variantRaw) ? variantRaw : {}
  if (toNumber(v.deleted) !== 0) return null

  const productId = String(product.id ?? '0')
  const variantId = String(v.id ?? variantIndex)
  const productName = String(product.name ?? 'Untitled')
  const brand =
    pickString(
      product.brand,
      product.brand_name,
      product.brandName,
      product.manufacturer,
    ) ?? ''
  const category_id = resolveCategoryId(product)
  const category = String(
    product.category ?? product.category_name ?? product.categoryName ?? product.type ?? '—',
  )

  const inv = isRecord(v.inventory_stock) ? v.inventory_stock : null
  const qtyAvailable = toNumber(
    v.quantity_available ?? inv?.quantity_available ?? inv?.quantity_on_hand,
  )
  const qtyOnHand = toNumber(inv?.quantity_on_hand)
  const stockMax = qtyOnHand > 0 ? qtyOnHand : Math.max(qtyAvailable, 1)

  const sku =
    pickString(
      v.sku,
      v.SKU,
      v.variant_sku,
      v.variantSku,
      v.seller_sku,
      v.sellerSku,
    ) ?? '—'
  const price = toNumber(v.selling_price ?? v.sellingPrice)
  const productPublished = resolvePublishStatusFromEntity(product) === 'published'
  const variantPublished = resolvePublishStatusFromEntity(v) === 'published'
  const publishStatus: PublishStatus =
    productPublished && variantPublished ? 'published' : 'draft'

  const variantApiId = String(v.id ?? variantIndex)
  const displayName =
    pickString(v.display_name, v.displayName) ?? ''

  return {
    id: `${productId}-${variantId}`,
    variantApiId,
    displayName,
    name: productName,
    brand,
    category_id,
    category,
    imageUrl:
      pickString(
        firstMediaUrl(v),
        firstMediaUrl(product),
        product.image_url,
        product.imageUrl,
        product.thumbnail,
        product.thumbnail_url,
        product.image,
      ) ?? null,
    sku,
    stockCount: qtyAvailable,
    stockMax,
    price,
    publishStatus,
  }
}

function buildParentSummaryRow(
  product: Record<string, unknown>,
  variantRows: ProductRow[],
  productIndex: number,
): ProductRow {
  const base = mapDtoToProduct(product, productIndex)
  if (variantRows.length === 0) return base

  const prices = variantRows.map((v) => v.price)
  const minPrice = Math.min(...prices)
  const productPublished = resolvePublishStatusFromEntity(product) === 'published'
  const anyVariantPublished = variantRows.some((v) => v.publishStatus === 'published')
  const publishStatus: PublishStatus =
    productPublished && anyVariantPublished ? 'published' : 'draft'

  const summarySku =
    pickString(
      product.sku,
      product.SKU,
      product.product_sku,
      product.productSku,
    ) ??
    (variantRows.length === 1 ? variantRows[0].sku : undefined) ??
    '—'

  return {
    ...base,
    id: String(product.id ?? base.id),
    sku: summarySku,
    stockCount: variantRows.reduce((s, v) => s + v.stockCount, 0),
    stockMax: Math.max(1, variantRows.reduce((s, v) => s + v.stockMax, 0)),
    price: minPrice,
    publishStatus,
    variants: variantRows,
  }
}

function mapProductWithVariants(raw: unknown, productIndex: number): ProductRow | null {
  const p = isRecord(raw) ? raw : {}
  if (toNumber(p.deleted) !== 0) return null

  const variants = Array.isArray(p.variants) ? p.variants : []
  if (variants.length === 0) {
    return mapDtoToProduct(raw, productIndex)
  }

  const variantRows: ProductRow[] = []
  variants.forEach((variant, vi) => {
    const row = mapVariantToRow(p, variant, vi)
    if (row) variantRows.push(row)
  })
  if (variantRows.length === 0) {
    return mapDtoToProduct(raw, productIndex)
  }
  return buildParentSummaryRow(p, variantRows, productIndex)
}

function extractArray(body: unknown): unknown[] {
  if (Array.isArray(body)) return body
  if (isRecord(body) && Array.isArray(body.data)) return body.data
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.items)) {
    return body.data.items
  }
  if (isRecord(body) && Array.isArray(body.items)) return body.items
  if (isRecord(body) && Array.isArray(body.results)) return body.results
  return []
}

function normalizeProductsResponse(body: unknown): ProductRow[] {
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.products)) {
    return body.data.products
      .map((p, i) => mapProductWithVariants(p, i))
      .filter((row): row is ProductRow => row !== null)
  }
  return extractArray(body).map(mapDtoToProduct)
}

function normalizeCountResponse(body: unknown): number {
  if (typeof body === 'number' && !Number.isNaN(body)) return body
  if (typeof body === 'string') {
    const n = Number.parseInt(body, 10)
    return Number.isNaN(n) ? 0 : n
  }
  if (!isRecord(body)) return 0
  if (typeof body.count === 'number') return body.count
  if (typeof body.total === 'number') return body.total
  const data = body.data
  if (typeof data === 'number') return data
  if (typeof data === 'string') {
    const n = Number.parseInt(data, 10)
    return Number.isNaN(n) ? 0 : n
  }
  if (isRecord(data)) {
    if (typeof data.count === 'number') return data.count
    if (typeof data.total === 'number') return data.total
  }
  return 0
}

function mapVariantSummary(
  v: Record<string, unknown>,
  index: number,
): ProductVariantSummary | null {
  if (toNumber(v.deleted) !== 0) return null
  const id = String(v.id ?? index)
  const displayName =
    pickString(v.display_name, v.displayName) ?? `Variant ${index + 1}`
  const inv = isRecord(v.inventory_stock) ? v.inventory_stock : null
  const qtyAvailable = toNumber(
    v.quantity_available ?? inv?.quantity_available ?? inv?.quantity_on_hand,
  )
  const sku =
    pickString(
      v.sku,
      v.SKU,
      v.variant_sku,
      v.variantSku,
      v.seller_sku,
      v.sellerSku,
    ) ?? '—'
  const price = toNumber(v.selling_price ?? v.sellingPrice)
  return {
    id,
    displayName,
    sku,
    price,
    stockCount: qtyAvailable,
  }
}

function mapToProductDetail(p: Record<string, unknown>): ProductDetail {
  const id = String(p.id ?? '')
  const variantsRaw = Array.isArray(p.variants) ? p.variants : []
  const variants: ProductVariantSummary[] = []
  variantsRaw.forEach((raw, i) => {
    const r = isRecord(raw) ? raw : {}
    const row = mapVariantSummary(r, i)
    if (row) variants.push(row)
  })
  const categoryId = toNumber(p.category_id ?? p.categoryId)
  const imageUrl =
    pickString(
      firstMediaUrl(p),
      p.image_url,
      p.imageUrl,
      p.thumbnail,
      p.thumbnail_url,
      p.image,
    ) ?? null
  return {
    id,
    name: String(p.name ?? ''),
    description: String(p.description ?? ''),
    category_id: categoryId,
    brand: pickString(p.brand, p.brand_name, p.brandName) ?? '',
    enabled: resolvePublishStatusFromEntity(p) === 'published',
    imageUrl,
    variants,
  }
}

function normalizeProductDetailResponse(body: unknown): ProductDetail | null {
  if (!isRecord(body)) return null
  const data = body.data
  if (isRecord(data)) {
    if (isRecord(data.product)) return mapToProductDetail(data.product)
    if (typeof data.id !== 'undefined') return mapToProductDetail(data)
    if (Array.isArray(data.products) && data.products[0]) {
      const first = data.products[0]
      if (isRecord(first)) return mapToProductDetail(first)
    }
  }
  if (typeof body.id !== 'undefined' && isRecord(body)) return mapToProductDetail(body)
  return null
}

function extractCreatedProductId(body: unknown): string | null {
  if (!isRecord(body)) return null
  const data = body.data
  if (isRecord(data)) {
    if (typeof data.id === 'number' || typeof data.id === 'string') {
      return String(data.id)
    }
    if (isRecord(data.product) && data.product.id != null) {
      return String(data.product.id)
    }
  }
  if (typeof body.id === 'number' || typeof body.id === 'string') {
    return String(body.id)
  }
  return null
}

export async function fetchProductDetail(productId: string): Promise<ProductDetail> {
  const { data } = await dashboardAxiosInstance.get<unknown>(
    `/products/${encodeURIComponent(productId)}/`,
  )
  const detail = normalizeProductDetailResponse(data)
  if (!detail) throw new Error('Product not found')
  return detail
}

export async function createProduct(body: ProductUpsertPayload): Promise<ProductDetail> {
  const { data } = await dashboardAxiosInstance.post<unknown>('/products/', body)
  const detail = normalizeProductDetailResponse(data)
  if (detail) return detail
  const createdId = extractCreatedProductId(data)
  if (createdId) return fetchProductDetail(createdId)
  throw new Error('Invalid response')
}

export async function updateProduct(
  productId: string,
  body: ProductUpsertPayload,
): Promise<ProductDetail> {
  const { data } = await dashboardAxiosInstance.put<unknown>(
    `/products/${encodeURIComponent(productId)}`,
    body,
  )
  const detail = normalizeProductDetailResponse(data)
  if (detail) return detail
  return fetchProductDetail(productId)
}

export async function deleteProductVariant(
  productId: string,
  variantId: string,
): Promise<void> {
  await dashboardAxiosInstance.delete(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
  )
}

function mapAttributesJson(raw: Record<string, unknown>): Record<string, string> {
  const a = raw.attributes_json ?? raw.attributesJson
  if (!isRecord(a)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(a)) {
    if (typeof v === 'string') out[k] = v
    else if (v != null) out[k] = String(v)
  }
  return out
}

function mapToProductVariantDetail(
  productId: string,
  raw: Record<string, unknown>,
): ProductVariantDetail {
  const inv = isRecord(raw.inventory_stock)
    ? raw.inventory_stock
    : isRecord(raw.inventoryStock)
      ? raw.inventoryStock
      : null
  const invRec = inv as Record<string, unknown> | null
  const quantity_available = toNumber(
    invRec == null
      ? 0
      : (invRec.quantity_available ?? invRec.quantityAvailable),
  )
  const quantity = toNumber(
    raw.quantity ?? invRec?.quantity_on_hand ?? invRec?.quantity_available ?? raw.stock,
  )

  return {
    id: String(raw.id ?? ''),
    productId,
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    display_name: pickString(raw.display_name, raw.displayName) ?? '',
    sku:
      pickString(raw.sku, raw.SKU, raw.variant_sku, raw.variantSku, raw.seller_sku, raw.sellerSku) ??
      '',
    barcode: pickString(raw.barcode, raw.barcode_value, raw.barcodeValue) ?? '',
    attributes_json: mapAttributesJson(raw),
    unit_of_measurement:
      pickString(raw.unit_of_measurement, raw.unitOfMeasurement, raw.uom) ?? '',
    unit_number: toNumber(raw.unit_number ?? raw.unitNumber),
    cost_price: toNumber(raw.cost_price ?? raw.costPrice),
    selling_price: toNumber(raw.selling_price ?? raw.sellingPrice),
    cart_allowed_quantity: (() => {
      const v =
        raw.cart_allowed_quantity ?? raw.cartAllowedQuantity ?? raw.max_cart_quantity
      if (v === null || v === undefined || v === '') return undefined
      const n = toNumber(v)
      return Number.isFinite(n) ? n : undefined
    })(),
    quantity_available,
    quantity,
    imageUrls: allMediaUrls(raw),
  }
}

function normalizeSingleVariantResponse(
  body: unknown,
  productId: string,
): ProductVariantDetail | null {
  if (!isRecord(body)) return null
  const data = body.data
  if (isRecord(data)) {
    if (isRecord(data.variant))
      return mapToProductVariantDetail(productId, data.variant)
    if (typeof data.id !== 'undefined') return mapToProductVariantDetail(productId, data)
  }
  if (typeof body.id !== 'undefined') return mapToProductVariantDetail(productId, body)
  return null
}

export async function fetchProductVariant(
  productId: string,
  variantId: string,
): Promise<ProductVariantDetail> {
  const { data } = await dashboardAxiosInstance.get<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/`,
  )
  const detail = normalizeSingleVariantResponse(data, productId)
  if (!detail) throw new Error('Variant not found')
  return detail
}

/**
 * POST may not return the full variant; resolve id from envelope and GET single variant.
 */
async function resolveCreatedVariant(
  productId: string,
  body: unknown,
): Promise<ProductVariantDetail> {
  if (!isRecord(body)) throw new Error('Invalid response')
  const data = body.data
  let variantId: string | null = null
  if (isRecord(data)) {
    if (typeof data.id === 'number' || typeof data.id === 'string') {
      variantId = String(data.id)
    } else if (isRecord(data.variant) && data.variant.id != null) {
      variantId = String(data.variant.id)
    }
  } else if (typeof body.id === 'number' || typeof body.id === 'string') {
    variantId = String(body.id)
  }
  if (!variantId) throw new Error('Invalid response')
  return fetchProductVariant(productId, variantId)
}

export async function createProductVariant(
  productId: string,
  body: ProductVariantUpsertPayload,
): Promise<ProductVariantDetail> {
  const { data } = await dashboardAxiosInstance.post<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/`,
    body,
  )
  const detail = normalizeSingleVariantResponse(data, productId)
  if (detail && detail.id) return detail
  return resolveCreatedVariant(productId, data)
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  body: ProductVariantUpsertPayload,
): Promise<ProductVariantDetail> {
  const { data } = await dashboardAxiosInstance.put<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    body,
  )
  const detail = normalizeSingleVariantResponse(data, productId)
  if (detail && detail.id) return detail
  return fetchProductVariant(productId, variantId)
}

export async function adjustProductVariantInventory(
  productId: string,
  variantId: string,
  body: VariantInventoryAdjustmentBody,
): Promise<void> {
  await dashboardAxiosInstance.post<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/inventory`,
    body,
  )
}

export async function fetchProductsList(query: ProductListQuery): Promise<ProductRow[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/products/', {
    params: buildProductQueryParams(query),
    paramsSerializer: { indexes: null },
  })
  return normalizeProductsResponse(data)
}

export async function fetchProductsCount(query: ProductListQuery): Promise<number> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/products/count', {
    params: buildProductQueryParams(query),
    paramsSerializer: { indexes: null },
  })
  return normalizeCountResponse(data)
}

/** Row from GET …/products/:p/variants/:v/attributes/ */
export interface ProductVariantAttributeMapDto {
  id: number
  product_variant_id: number
  attribute_id: number
  attribute_value_id: number
  attribute: {
    id: number
    name: string
    description: string
  }
  attribute_value: {
    id: number
    attribute_id: number
    value: string
  }
}

function toPositiveInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 1) return Math.trunc(v)
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10)
    return Number.isFinite(n) && n >= 1 ? n : null
  }
  return null
}

function mapVariantAttributeMap(raw: unknown): ProductVariantAttributeMapDto | null {
  const r = isRecord(raw) ? raw : {}
  const id = toPositiveInt(r.id)
  const attribute_id = toPositiveInt(r.attribute_id ?? r.attributeId)
  const attribute_value_id = toPositiveInt(r.attribute_value_id ?? r.attributeValueId)
  if (id == null || attribute_id == null || attribute_value_id == null) return null
  const product_variant_id = toPositiveInt(r.product_variant_id ?? r.productVariantId) ?? 0
  const attrRaw = r.attribute
  const avRaw = r.attribute_value ?? r.attributeValue
  const ar = isRecord(attrRaw) ? attrRaw : {}
  const avr = isRecord(avRaw) ? avRaw : {}
  const aid = toPositiveInt(ar.id ?? attribute_id) ?? attribute_id
  const avId = toPositiveInt(avr.id ?? attribute_value_id) ?? attribute_value_id
  return {
    id,
    product_variant_id,
    attribute_id: aid,
    attribute_value_id: avId,
    attribute: {
      id: aid,
      name: typeof ar.name === 'string' ? ar.name : String(ar.name ?? ''),
      description:
        typeof ar.description === 'string' ? ar.description : String(ar.description ?? ''),
    },
    attribute_value: {
      id: avId,
      attribute_id: toPositiveInt(avr.attribute_id ?? avr.attributeId) ?? aid,
      value: typeof avr.value === 'string' ? avr.value : String(avr.value ?? ''),
    },
  }
}

function normalizeVariantAttributeMapsResponse(body: unknown): ProductVariantAttributeMapDto[] {
  if (!isRecord(body)) return []
  const data = body.data
  if (!isRecord(data)) return []
  const list = data.product_variant_attribute_maps ?? data.productVariantAttributeMaps
  if (!Array.isArray(list)) return []
  const out: ProductVariantAttributeMapDto[] = []
  for (const x of list) {
    const m = mapVariantAttributeMap(x)
    if (m) out.push(m)
  }
  return out
}

export interface VariantAttributeMapsListQuery {
  page_no: number
  page_size: number
  sort_by: string
  sort_order: 'asc' | 'desc'
}

export async function fetchProductVariantAttributeMaps(
  productId: string,
  variantId: string,
  query: VariantAttributeMapsListQuery = {
    page_no: 1,
    page_size: 100,
    sort_by: 'created_at',
    sort_order: 'desc',
  },
): Promise<ProductVariantAttributeMapDto[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/attributes/`,
    {
      params: {
        page_no: query.page_no,
        page_size: query.page_size,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
      },
      paramsSerializer: { indexes: null },
    },
  )
  return normalizeVariantAttributeMapsResponse(data)
}

export async function createProductVariantAttributeMap(
  productId: string,
  variantId: string,
  body: { attribute_id: number; attribute_value_id: number },
): Promise<void> {
  await dashboardAxiosInstance.post<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/attributes/`,
    body,
  )
}

export async function updateProductVariantAttributeMap(
  productId: string,
  variantId: string,
  mapId: number,
  body: { attribute_id: number; attribute_value_id: number },
): Promise<void> {
  await dashboardAxiosInstance.put<unknown>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/attributes/${encodeURIComponent(String(mapId))}/`,
    body,
  )
}
