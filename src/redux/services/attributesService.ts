import type { BaseListQuery } from '../../types/listQuery'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

export interface CatalogueAttribute {
  id: number
  name: string
  description: string
}

export interface AttributeListQuery extends BaseListQuery {
  search?: string | null
}

function toIntId(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 1) return Math.trunc(v)
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10)
    return Number.isFinite(n) && n >= 1 ? n : null
  }
  return null
}

function mapRawToAttribute(raw: unknown): CatalogueAttribute | null {
  const r = isRecord(raw) ? raw : {}
  const id = toIntId(r.id ?? r.attribute_id ?? r.attributeId)
  if (id == null) return null
  const name = typeof r.name === 'string' ? r.name : String(r.name ?? '')
  const description =
    typeof r.description === 'string' ? r.description : String(r.description ?? '')
  return { id, name, description }
}

function normalizeAttributesListPayload(body: unknown): CatalogueAttribute[] {
  if (!isRecord(body)) return []
  const data = body.data
  if (isRecord(data)) {
    const candidates = [
      data.attributes,
      data.attribute_list,
      data.items,
      data.results,
      data.rows,
    ]
    for (const c of candidates) {
      if (Array.isArray(c)) {
        const out: CatalogueAttribute[] = []
        for (const x of c) {
          const a = mapRawToAttribute(x)
          if (a) out.push(a)
        }
        return out
      }
    }
    if (Array.isArray(data)) {
      const out: CatalogueAttribute[] = []
      for (const x of data) {
        const a = mapRawToAttribute(x)
        if (a) out.push(a)
      }
      return out
    }
  }
  if (Array.isArray(body)) {
    const out: CatalogueAttribute[] = []
    for (const x of body) {
      const a = mapRawToAttribute(x)
      if (a) out.push(a)
    }
    return out
  }
  return []
}

function buildAttributeQueryParams(
  q: AttributeListQuery,
): Record<string, string | number | number[]> {
  const o: Record<string, string | number | number[]> = {
    page_no: q.page_no,
    page_size: q.page_size,
    sort_by: q.sort_by,
    sort_order: q.sort_order,
  }
  if (q.status !== undefined && q.status !== null) o.status = q.status
  const search = q.search?.trim()
  if (search) o.search = search
  if (q.ids?.length) o.ids = q.ids
  return o
}

export async function fetchAttributesList(q: AttributeListQuery): Promise<CatalogueAttribute[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/attributes/', {
    params: buildAttributeQueryParams(q),
    paramsSerializer: { indexes: null },
  })
  return normalizeAttributesListPayload(data)
}

/** POST /attributes/ may return the entity under `data.attribute` or flat in `data` / `data.data`. */
function unwrapCreatedAttributePayload(root: unknown): Record<string, unknown> | null {
  if (!isRecord(root)) return null
  const envelope = isRecord(root.data) ? root.data : root
  if (!isRecord(envelope)) return null
  const nested = envelope.attribute ?? envelope.Attribute
  if (isRecord(nested)) return nested
  if (toIntId(envelope.id) != null) return envelope
  return null
}

export async function createAttribute(body: {
  name: string
  description: string
}): Promise<CatalogueAttribute> {
  const { data } = await dashboardAxiosInstance.post<unknown>('/attributes/', body)
  if (!isRecord(data)) throw new Error('Invalid response')
  const inner = unwrapCreatedAttributePayload(data)
  if (!inner) throw new Error('Invalid attribute response')
  const mapped = mapRawToAttribute(inner)
  if (mapped) return mapped
  throw new Error('Invalid attribute response')
}

/** POST …/attributes/:id/values/ may return the entity on `data`, under `data.data`, or nested as `attribute_value`. */
function unwrapCreatedAttributeValuePayload(root: unknown): Record<string, unknown> | null {
  if (!isRecord(root)) return null
  const envelope = isRecord(root.data) ? root.data : root
  if (!isRecord(envelope)) return null
  const nested = envelope.attribute_value ?? envelope.attributeValue
  if (isRecord(nested)) return nested
  if (toIntId(envelope.id) != null) return envelope
  return null
}

export async function createAttributeValue(
  attributeId: number,
  body: { value: string },
): Promise<{ id: number; attribute_id: number; value: string }> {
  const { data } = await dashboardAxiosInstance.post<unknown>(
    `/attributes/${encodeURIComponent(String(attributeId))}/values/`,
    body,
  )
  if (!isRecord(data)) throw new Error('Invalid response')
  const inner = unwrapCreatedAttributeValuePayload(data)
  if (!inner) throw new Error('Invalid attribute value response')
  const id = toIntId(inner.id ?? inner.attribute_value_id)
  const aid = toIntId(inner.attribute_id ?? inner.attributeId ?? attributeId)
  const value = typeof inner.value === 'string' ? inner.value : String(inner.value ?? '')
  if (id == null || aid == null) throw new Error('Invalid attribute value response')
  return { id, attribute_id: aid, value }
}

export async function updateAttributeValue(
  attributeId: number,
  valueId: number,
  body: { value: string },
): Promise<void> {
  await dashboardAxiosInstance.put<unknown>(
    `/attributes/${encodeURIComponent(String(attributeId))}/values/${encodeURIComponent(String(valueId))}/`,
    body,
  )
}
