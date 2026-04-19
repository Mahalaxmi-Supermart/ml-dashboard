import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  clearAdjustVariantInventory,
  clearSelectedVariant,
  fetchVariantDetailRequest,
} from '../../redux/reducers/productsSlice'
import { updateProductVariant } from '../../redux/services/productsService'
import { VariantInventoryAdjustmentSection } from './components/VariantInventoryAdjustmentSection'
import { ProductVariantUpsertForm } from './components/ProductVariantUpsertForm'
import { VariantImagesUpload } from './components/VariantImagesUpload'
import { VariantFilterAttributesSection } from './components/VariantFilterAttributesSection'
import {
  emptyProductVariantFormValues,
  productVariantDetailToFormValues,
  productVariantFormValuesToPayload,
  type ProductVariantFormValues,
} from './productsTypes'

export function ProductVariantEditPage() {
  const dispatch = useAppDispatch()
  const { productId: productIdParam, variantId: variantIdParam } = useParams<{
    productId: string
    variantId: string
  }>()
  const productId = productIdParam ?? ''
  const variantId = variantIdParam ?? ''

  const selectedVariant = useAppSelector((s) => s.products.selectedVariant)

  const { control, handleSubmit, reset } = useForm<ProductVariantFormValues>({
    defaultValues: emptyProductVariantFormValues(),
  })

  const watchedDisplayName = useWatch({ control, name: 'display_name' })
  const watchedName = useWatch({ control, name: 'name' })

  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const invalidId = productId.length === 0 || variantId.length === 0

  useEffect(() => {
    if (invalidId) return
    dispatch(fetchVariantDetailRequest({ productId, variantId }))
    return () => {
      dispatch(clearSelectedVariant())
      dispatch(clearAdjustVariantInventory())
    }
  }, [dispatch, productId, variantId, invalidId])

  useEffect(() => {
    const d = selectedVariant.data
    if (!d) return
    reset(productVariantDetailToFormValues(d))
  }, [selectedVariant.data, reset])

  const onValid = async (values: ProductVariantFormValues) => {
    if (invalidId) return

    setSaveError(null)
    setSubmitting(true)
    try {
      await updateProductVariant(
        productId,
        variantId,
        productVariantFormValuesToPayload(values, { includeQuantity: false }),
      )
      dispatch(fetchVariantDetailRequest({ productId, variantId }))
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Could not save variant')
    } finally {
      setSubmitting(false)
    }
  }

  if (invalidId) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Edit variant
        </Typography>
        <Typography color="error">Invalid product or variant.</Typography>
        <Button component={RouterLink} to="/products" variant="outlined" sx={{ mt: 2 }}>
          Back to list
        </Button>
      </Box>
    )
  }

  const showFormShell = Boolean(selectedVariant.data) || selectedVariant.pending
  const showInitialLoad = selectedVariant.pending && !selectedVariant.data
  const detail = selectedVariant.data

  const mediaLabel =
    watchedDisplayName?.trim() ||
    watchedName?.trim() ||
    detail?.display_name.trim() ||
    detail?.name.trim() ||
    'Variant'

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Edit variant
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
        <Typography color="text.primary">{variantId}</Typography>
      </Breadcrumbs>

      <ErrorAlert error={selectedVariant.error} sx={{ mb: 2 }} />
      {selectedVariant.error && !selectedVariant.pending ? (
        <Button
          variant="outlined"
          onClick={() => dispatch(fetchVariantDetailRequest({ productId, variantId }))}
          sx={{ mb: 2 }}
        >
          Retry
        </Button>
      ) : null}

      {showFormShell ? (
        <>
          <ProductVariantUpsertForm
            heroTitle="Variant details"
            heroDescription="Update identifiers, pricing, attributes, and images. Filter attributes and stock each have their own save action below."
            loading={showInitialLoad}
            showQuantityField={false}
            control={control}
            onSubmit={handleSubmit(onValid)}
            pending={submitting}
            error={saveError}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            cancelTo={`/products/${productId}/edit`}
            additionalFields={
              detail ? (
                <VariantImagesUpload
                  deferUpload={false}
                  variantId={detail.id}
                  displayName={mediaLabel}
                  existingImageUrls={detail.imageUrls}
                  onImmediateUploadComplete={() =>
                    dispatch(fetchVariantDetailRequest({ productId, variantId }))
                  }
                />
              ) : undefined
            }
          />

          <VariantFilterAttributesSection
            mode="edit"
            productId={productId}
            variantId={variantId}
            disabled={submitting}
            onFiltersSaved={() =>
              dispatch(fetchVariantDetailRequest({ productId, variantId }))
            }
          />

          {detail ? (
            <VariantInventoryAdjustmentSection productId={productId} variantId={variantId} />
          ) : null}
        </>
      ) : null}
    </Box>
  )
}
