/** Scope passed to POST .../medias/upload-url (`type` field). */
export const MEDIA_UPLOAD_SCOPE = {
  PRODUCT: 'PRODUCT',
  PRODUCT_VARIANT: 'PRODUCT_VARIANT',
  CATEGORY: 'CATEGORY',
} as const

export type MediaUploadScope = (typeof MEDIA_UPLOAD_SCOPE)[keyof typeof MEDIA_UPLOAD_SCOPE]

/** `entity_type` on POST .../medias/ */
export const MEDIA_ENTITY_TYPE = {
  PRODUCT: 'PRODUCT',
  PRODUCT_VARIANT: 'PRODUCT_VARIANT',
  CATEGORY: 'CATEGORY',
} as const

export type MediaEntityType = (typeof MEDIA_ENTITY_TYPE)[keyof typeof MEDIA_ENTITY_TYPE]
