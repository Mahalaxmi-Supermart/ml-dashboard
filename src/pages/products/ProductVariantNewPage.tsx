import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  clearCreateVariant,
  createVariantRequest,
  fetchPageRequest,
} from '../../redux/reducers/productsSlice'
import { uploadProductVariantImage } from '../../redux/services/mediasService'
import { ProductVariantUpsertForm } from './components/ProductVariantUpsertForm'
import { VariantImagesUpload } from './components/VariantImagesUpload'
import {
  VariantFilterAttributesSection,
  type VariantFilterAttributesSectionHandle,
} from './components/VariantFilterAttributesSection'
import { syncVariantFilterAttributes } from './utils/syncVariantFilterAttributes'
import {
  emptyProductVariantFormValues,
  productVariantFormValuesToPayload,
  type ProductVariantDetail,
  type ProductVariantFormValues,
} from './productsTypes'

export function ProductVariantNewPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { productId: productIdParam } = useParams<{ productId: string }>()
  const productId = productIdParam ?? ''

  const create = useAppSelector((s) => s.products.createVariant)
  const lastQuery = useAppSelector((s) => s.products.lastQuery)

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const pendingFilesRef = useRef<File[]>([])
  useEffect(() => {
    pendingFilesRef.current = pendingFiles
  }, [pendingFiles])

  const [postCreateBusy, setPostCreateBusy] = useState(false)
  const [postCreateImageError, setPostCreateImageError] = useState<string | null>(null)
  const [postCreateFilterError, setPostCreateFilterError] = useState<string | null>(null)
  const postCreatePipelineStartedRef = useRef(false)
  const filterRef = useRef<VariantFilterAttributesSectionHandle>(null)

  const { control, handleSubmit } = useForm<ProductVariantFormValues>({
    defaultValues: emptyProductVariantFormValues(),
  })

  const invalidId = productId.length === 0

  const finishAfterVariantCreated = useCallback(
    async (detail: ProductVariantDetail) => {
      const files = [...pendingFilesRef.current]
      const label = detail.display_name.trim() || detail.name.trim() || 'Variant'

      const rows = filterRef.current?.getRows() ?? []
      await syncVariantFilterAttributes(productId, detail.id, rows, new Map())
      await filterRef.current?.hydrateFromVariant(detail.id)

      if (files.length > 0) {
        for (const file of files) {
          await uploadProductVariantImage({
            variantId: detail.id,
            file,
            displayName: label,
          })
        }
      }
      navigate(`/products/${productId}/edit`, { replace: true })
      dispatch(clearCreateVariant())
      dispatch(fetchPageRequest(lastQuery))
      setPendingFiles([])
      postCreatePipelineStartedRef.current = false
    },
    [dispatch, lastQuery, navigate, productId],
  )

  useEffect(() => {
    dispatch(clearCreateVariant())
    postCreatePipelineStartedRef.current = false
  }, [dispatch])

  useEffect(() => {
    if (!create.data || create.pending) return
    if (postCreatePipelineStartedRef.current) return
    postCreatePipelineStartedRef.current = true
    setPostCreateImageError(null)
    setPostCreateFilterError(null)

    const detail = create.data
    setPostCreateBusy(true)
    void (async () => {
      try {
        await finishAfterVariantCreated(detail)
      } catch (e: unknown) {
        try {
          await filterRef.current?.hydrateFromVariant(detail.id)
        } catch {
          // ignore secondary fetch errors
        }
        const msg =
          e instanceof Error ? e.message : 'Something went wrong after the variant was created.'
        const lower = msg.toLowerCase()
        if (lower.includes('upload') || lower.includes('image') || lower.includes('media')) {
          setPostCreateImageError(msg)
          setPostCreateFilterError(null)
        } else {
          setPostCreateFilterError(msg)
          setPostCreateImageError(null)
        }
        postCreatePipelineStartedRef.current = false
      } finally {
        setPostCreateBusy(false)
      }
    })()
  }, [create.data, create.pending, finishAfterVariantCreated])

  const onValid = async (values: ProductVariantFormValues) => {
    if (invalidId) return
    const filterValid = await filterRef.current?.validate()
    if (filterValid === false) return
    setPostCreateImageError(null)
    setPostCreateFilterError(null)
    dispatch(
      createVariantRequest({
        productId,
        body: productVariantFormValuesToPayload(values),
      }),
    )
  }

  const retryPostCreateUpload = () => {
    const detail = create.data
    const files = [...pendingFilesRef.current]
    if (!detail || files.length === 0) return
    setPostCreateImageError(null)
    setPostCreateBusy(true)
    const label = detail.display_name.trim() || detail.name.trim() || 'Variant'
    void (async () => {
      try {
        for (const file of files) {
          await uploadProductVariantImage({
            variantId: detail.id,
            file,
            displayName: label,
          })
        }
        navigate(`/products/${productId}/edit`, { replace: true })
        dispatch(clearCreateVariant())
        dispatch(fetchPageRequest(lastQuery))
        setPendingFiles([])
      } catch (e: unknown) {
        setPostCreateImageError(
          e instanceof Error ? e.message : 'Could not upload images. Variant was created.',
        )
      } finally {
        setPostCreateBusy(false)
      }
    })()
  }

  const retryPostCreateFilterSync = () => {
    const detail = create.data
    if (!detail) return
    setPostCreateFilterError(null)
    setPostCreateImageError(null)
    setPostCreateBusy(true)
    void (async () => {
      try {
        await finishAfterVariantCreated(detail)
      } catch (e: unknown) {
        try {
          await filterRef.current?.hydrateFromVariant(detail.id)
        } catch {
          // ignore
        }
        const msg = e instanceof Error ? e.message : 'Could not complete setup. Variant was created.'
        const lower = msg.toLowerCase()
        if (lower.includes('upload') || lower.includes('image') || lower.includes('media')) {
          setPostCreateImageError(msg)
        } else {
          setPostCreateFilterError(msg)
        }
      } finally {
        setPostCreateBusy(false)
      }
    })()
  }

  const formPending = create.pending || postCreateBusy

  if (invalidId) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Add variant
        </Typography>
        <Typography color="error">Invalid product.</Typography>
        <Button component={RouterLink} to="/products" variant="outlined" sx={{ mt: 2 }}>
          Back to list
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Add variant
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Products
        </Link>
        <Link
          component={RouterLink}
          to={`/products/${productId}/edit`}
          underline="hover"
          color="inherit"
        >
          Product
        </Link>
        <Typography color="text.primary">New variant</Typography>
      </Breadcrumbs>

      <ErrorAlert error={postCreateFilterError} sx={{ mb: 2 }} />
      {postCreateFilterError && create.data ? (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={postCreateBusy}
            onClick={retryPostCreateFilterSync}
          >
            {postCreateBusy ? 'Saving…' : 'Retry saving filter attributes'}
          </Button>
        </Box>
      ) : null}

      <ErrorAlert error={postCreateImageError} sx={{ mb: 2 }} />
      {postCreateImageError && create.data ? (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={postCreateBusy}
            onClick={retryPostCreateUpload}
          >
            {postCreateBusy ? 'Uploading…' : 'Retry image upload'}
          </Button>
        </Box>
      ) : null}

      <ProductVariantUpsertForm
        heroTitle="New variant"
        heroDescription="Define SKU, pricing, inventory, and optional attribute metadata for this product line item."
        control={control}
        onSubmit={handleSubmit(onValid)}
        pending={formPending}
        error={create.error}
        submitLabel="Create variant"
        pendingLabel="Creating…"
        cancelTo={`/products/${productId}/edit`}
        additionalFields={
          <VariantImagesUpload
            deferUpload
            displayName=""
            queuedFiles={pendingFiles}
            onQueuedFilesChange={(files) => {
              setPostCreateImageError(null)
              postCreatePipelineStartedRef.current = false
              setPendingFiles(files)
            }}
          />
        }
      />

      <VariantFilterAttributesSection
        ref={filterRef}
        mode="create"
        productId={productId}
        persistedVariantId={create.data?.id ?? null}
        disabled={formPending}
        onFiltersSaved={() => setPostCreateFilterError(null)}
      />
    </Box>
  )
}
