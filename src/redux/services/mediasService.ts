import axios from 'axios'
import { MEDIA_RECORD_STATUS, MEDIA_RECORD_TYPE } from '../../constants/mediaRecord'
import {
  MEDIA_ENTITY_TYPE,
  MEDIA_UPLOAD_SCOPE,
  type MediaEntityType,
  type MediaUploadScope,
} from '../../constants/mediaUpload'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

export interface MediaUploadUrlPayload {
  filename: string
  content_type: string
  type: MediaUploadScope
}

export interface MediaUploadUrlResult {
  upload_url: string
  object_key: string
}

export interface CreateMediaPayload {
  entity_type: MediaEntityType
  entity_id: number
  type: number
  url: string
  name: string
  status: number
}

function parseUploadUrlResponse(body: unknown): MediaUploadUrlResult {
  if (!isRecord(body)) throw new Error('Invalid upload URL response')
  const data = body.data
  if (!isRecord(data)) throw new Error('Invalid upload URL response')
  const uploadUrl =
    typeof data.upload_url === 'string'
      ? data.upload_url
      : typeof data.uploadUrl === 'string'
        ? data.uploadUrl
        : ''
  const objectKey =
    typeof data.object_key === 'string'
      ? data.object_key
      : typeof data.objectKey === 'string'
        ? data.objectKey
        : ''
  if (!uploadUrl || !objectKey) throw new Error('Invalid upload URL response')
  return { upload_url: uploadUrl, object_key: objectKey }
}

export async function requestMediaUploadUrl(
  payload: MediaUploadUrlPayload,
): Promise<MediaUploadUrlResult> {
  const { data } = await dashboardAxiosInstance.post<unknown>(
    '/medias/upload-url',
    payload,
  )
  return parseUploadUrlResponse(data)
}

/**
 * PUT raw bytes to the presigned URL. Uses a plain axios call (not dashboard client)
 * so the request is not sent to the dashboard API host.
 */
export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  })
}

export async function createMediaRecord(body: CreateMediaPayload): Promise<void> {
  await dashboardAxiosInstance.post<unknown>('/medias/', body)
}

function resolveFilename(file: File): string {
  const n = file.name?.trim()
  if (n) return n
  return 'image.bin'
}

function resolveContentType(file: File): string {
  if (file.type && file.type.startsWith('image/')) return file.type
  return 'image/jpeg'
}

export async function uploadProductImage(params: {
  productId: string
  file: File
  productName: string
}): Promise<void> {
  const { productId, file, productName } = params
  const entityId = Number.parseInt(productId, 10)
  if (!Number.isFinite(entityId) || entityId < 1) {
    throw new Error('Invalid product id')
  }

  const filename = resolveFilename(file)
  const content_type = resolveContentType(file)

  const { upload_url, object_key } = await requestMediaUploadUrl({
    filename,
    content_type,
    type: MEDIA_UPLOAD_SCOPE.PRODUCT,
  })

  await uploadFileToPresignedUrl(upload_url, file, content_type)

  await createMediaRecord({
    entity_type: MEDIA_ENTITY_TYPE.PRODUCT,
    entity_id: entityId,
    type: MEDIA_RECORD_TYPE.IMAGE,
    url: object_key,
    name: productName.trim() || filename,
    status: MEDIA_RECORD_STATUS.ACTIVE,
  })
}

export async function uploadProductVariantImage(params: {
  variantId: string
  file: File
  displayName: string
}): Promise<void> {
  const { variantId, file, displayName } = params
  const entityId = Number.parseInt(variantId, 10)
  if (!Number.isFinite(entityId) || entityId < 1) {
    throw new Error('Invalid variant id')
  }

  const filename = resolveFilename(file)
  const content_type = resolveContentType(file)

  const { upload_url, object_key } = await requestMediaUploadUrl({
    filename,
    content_type,
    type: MEDIA_UPLOAD_SCOPE.PRODUCT_VARIANT,
  })

  await uploadFileToPresignedUrl(upload_url, file, content_type)

  await createMediaRecord({
    entity_type: MEDIA_ENTITY_TYPE.PRODUCT_VARIANT,
    entity_id: entityId,
    type: MEDIA_RECORD_TYPE.IMAGE,
    url: object_key,
    name: displayName.trim() || filename,
    status: MEDIA_RECORD_STATUS.ACTIVE,
  })
}
