import {
  createAttribute,
  createAttributeValue,
  fetchAttributesList,
  updateAttributeValue,
} from '../../../redux/services/attributesService'
import {
  createProductVariantAttributeMap,
  updateProductVariantAttributeMap,
} from '../../../redux/services/productsService'
import type { VariantFilterAttributeFormRow } from '../productsTypes'

export type VariantFilterAttributeInitialSnapshot = {
  attributeId: number
  attributeValueId: number
  value: string
}

function isBlankRow(row: VariantFilterAttributeFormRow): boolean {
  return !row.attributeName.trim() && !row.value.trim()
}

async function resolveAttributeId(
  attributeName: string,
  hintId: number | null,
): Promise<number> {
  const name = attributeName.trim()
  if (!name) throw new Error('Each filter attribute needs a name')
  if (hintId != null && hintId >= 1) return hintId
  const found = await fetchAttributesList({
    page_no: 1,
    page_size: 100,
    sort_by: 'created_at',
    sort_order: 'desc',
    search: name,
  })
  const exact = found.find((a) => a.name.trim().toLowerCase() === name.toLowerCase())
  if (exact) return exact.id
  const created = await createAttribute({ name, description: name })
  return created.id
}

/**
 * Persists catalogue attribute + value + variant mapping for each non-empty row.
 * Update rules follow the dashboard API contract (PUT value, PUT map when attribute changes).
 */
export async function syncVariantFilterAttributes(
  productId: string,
  variantId: string,
  rows: VariantFilterAttributeFormRow[],
  initialByMapId: ReadonlyMap<number, VariantFilterAttributeInitialSnapshot>,
): Promise<void> {
  for (const row of rows) {
    if (isBlankRow(row)) continue
    if (!row.value.trim()) throw new Error('Each filter attribute needs a value')
    if (!row.attributeName.trim()) throw new Error('Each filter attribute needs a name')

    const attributeId = await resolveAttributeId(row.attributeName, row.attributeId)

    if (row.mapId == null) {
      const { id: valueId } = await createAttributeValue(attributeId, {
        value: row.value.trim(),
      })
      await createProductVariantAttributeMap(productId, variantId, {
        attribute_id: attributeId,
        attribute_value_id: valueId,
      })
      continue
    }

    const initial = initialByMapId.get(row.mapId)
    if (!initial) {
      throw new Error('Filter attribute row is out of sync. Reload the page and try again.')
    }

    const attrChanged = attributeId !== initial.attributeId
    const valueChanged = row.value.trim() !== initial.value

    if (attrChanged) {
      await updateProductVariantAttributeMap(productId, variantId, row.mapId, {
        attribute_id: attributeId,
        attribute_value_id: initial.attributeValueId,
      })
      if (valueChanged) {
        await updateAttributeValue(attributeId, initial.attributeValueId, {
          value: row.value.trim(),
        })
      }
    } else if (valueChanged) {
      await updateAttributeValue(attributeId, initial.attributeValueId, {
        value: row.value.trim(),
      })
    }
  }
}
