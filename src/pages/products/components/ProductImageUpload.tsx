import ImageOutlined from '@mui/icons-material/ImageOutlined'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { uploadProductImage } from '../../../redux/services/mediasService'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp'

export type ProductImageUploadProps = {
  /**
   * When true, only store the file and show a local preview; parent uploads after the product exists.
   * When false, upload immediately (edit product with `productId`).
   */
  deferUpload: boolean
  productId?: string
  /** Display name for POST /medias (and presigned flow). */
  entityName: string
  currentImageUrl?: string | null
  onDeferredFileChange?: (file: File | null) => void
  onImmediateUploadComplete?: () => void
}

export function ProductImageUpload({
  deferUpload,
  productId,
  entityName,
  currentImageUrl = null,
  onDeferredFileChange,
  onImmediateUploadComplete,
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [blobPreview, setBlobPreview] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (blobPreview?.startsWith('blob:')) URL.revokeObjectURL(blobPreview)
    }
  }, [blobPreview])

  const applyFile = async (file: File | null) => {
    setError(null)
    if (blobPreview?.startsWith('blob:')) URL.revokeObjectURL(blobPreview)
    setBlobPreview(null)
    onDeferredFileChange?.(file)

    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setBlobPreview(previewUrl)

    if (deferUpload || !productId) return

    setPending(true)
    try {
      await uploadProductImage({
        productId,
        file,
        productName: entityName.trim() || file.name,
      })
      URL.revokeObjectURL(previewUrl)
      setBlobPreview(null)
      onImmediateUploadComplete?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Image upload failed')
    } finally {
      setPending(false)
    }
  }

  const displaySrc = blobPreview ?? currentImageUrl ?? undefined

  return (
    <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
          Product image
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {deferUpload
            ? 'PNG, JPEG, GIF, or WebP. The file uploads automatically after the product is created.'
            : 'PNG, JPEG, GIF, or WebP. Choosing a file uploads it right away.'}
        </Typography>

        <ErrorAlert error={error} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { sm: 'center' },
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {displaySrc ? (
              <Box
                component="img"
                src={displaySrc}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <ImageOutlined sx={{ fontSize: 40, color: 'action.disabled' }} aria-hidden />
            )}
          </Box>

          <Box>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(ev) => {
                const f = ev.target.files?.[0] ?? null
                void applyFile(f)
                ev.target.value = ''
              }}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              sx={{ textTransform: 'none' }}
            >
              {pending ? 'Uploading…' : displaySrc ? 'Replace image' : 'Choose image'}
            </Button>
            {displaySrc ? (
              <Button
                size="small"
                color="inherit"
                disabled={pending}
                onClick={() => void applyFile(null)}
                sx={{ ml: 1, textTransform: 'none' }}
              >
                Clear
              </Button>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}
