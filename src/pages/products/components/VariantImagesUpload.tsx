import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { uploadProductVariantImage } from '../../../redux/services/mediasService'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp'

export type VariantImagesUploadProps = {
  /**
   * When true, collect files locally; parent uploads after the variant exists (`variantId`).
   * When false, each selected file uploads immediately for the given `variantId`.
   */
  deferUpload: boolean
  variantId?: string
  /** Label stored on media records (variant display name or file name). */
  displayName: string
  /** Images already saved for this variant (edit mode). */
  existingImageUrls?: string[]
  /** Required when `deferUpload` — pending files before create. */
  queuedFiles?: File[]
  onQueuedFilesChange?: (files: File[]) => void
  onImmediateUploadComplete?: () => void
}

export function VariantImagesUpload({
  deferUpload,
  variantId,
  displayName,
  existingImageUrls = [],
  queuedFiles = [],
  onQueuedFilesChange,
  onImmediateUploadComplete,
}: VariantImagesUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewEntries = useMemo(() => {
    return queuedFiles.map((file, i) => ({
      key: `${file.name}-${file.size}-${i}`,
      url: URL.createObjectURL(file),
      fileIndex: i,
    }))
  }, [queuedFiles])

  useEffect(() => {
    return () => {
      previewEntries.forEach((p) => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
      })
    }
  }, [previewEntries])

  const removeQueuedAt = (index: number) => {
    const next = queuedFiles.filter((_, i) => i !== index)
    onQueuedFilesChange?.(next)
  }

  const applyIncomingFiles = async (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter(Boolean)
    if (picked.length === 0) return
    setError(null)

    if (deferUpload) {
      const next = [...queuedFiles, ...picked]
      onQueuedFilesChange?.(next)
      return
    }

    if (!variantId) {
      setError('Save the variant before adding images.')
      return
    }

    setPending(true)
    try {
      for (const file of picked) {
        await uploadProductVariantImage({
          variantId,
          file,
          displayName: displayName.trim() || file.name,
        })
      }
      onImmediateUploadComplete?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Image upload failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
          Variant images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {deferUpload
            ? 'You can attach several images. They upload after the variant is created (same flow as product image on “Add product”).'
            : 'PNG, JPEG, GIF, or WebP. Each file uploads as you select it; you can add multiple images.'}
        </Typography>

        <ErrorAlert error={error} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            multiple
            onChange={(ev) => {
              void applyIncomingFiles(ev.target.files)
              ev.target.value = ''
            }}
          />
          <Button
            variant="outlined"
            size="small"
            disabled={pending}
            startIcon={<AddPhotoAlternateOutlined />}
            onClick={() => inputRef.current?.click()}
            sx={{ textTransform: 'none' }}
          >
            {pending ? 'Uploading…' : 'Add images'}
          </Button>
        </Box>

        {(existingImageUrls.length > 0 || previewEntries.length > 0) && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {existingImageUrls.length > 0
              ? `${existingImageUrls.length} on server`
              : null}
            {existingImageUrls.length > 0 && previewEntries.length > 0 ? ' · ' : null}
            {previewEntries.length > 0 ? `${previewEntries.length} pending upload` : null}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {existingImageUrls.map((src) => (
            <Box
              key={src}
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'grey.50',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={src}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
          ))}

          {previewEntries.map((p) => (
            <Box
              key={p.key}
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'grey.50',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={p.url}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {deferUpload ? (
                <IconButton
                  size="small"
                  aria-label="Remove from queue"
                  onClick={() => removeQueuedAt(p.fileIndex)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    p: 0.25,
                  }}
                >
                  <CloseOutlined fontSize="small" />
                </IconButton>
              ) : null}
            </Box>
          ))}

          {existingImageUrls.length === 0 && previewEntries.length === 0 ? (
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                border: 1,
                borderStyle: 'dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageOutlined sx={{ fontSize: 36, color: 'action.disabled' }} aria-hidden />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Grid>
  )
}
