import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchListRequest } from '../../redux/reducers/categoriesSlice'
import {
  clearDeleteVariant,
  clearSelectedProduct,
  clearUpdateProduct,
  deleteVariantRequest,
  fetchProductDetailRequest,
  updateProductRequest,
} from '../../redux/reducers/productsSlice'
import {
  productDetailToFormValues,
  productFormValuesToPayload,
  type ProductFormValues,
} from './productsTypes'
import { ProductImageUpload } from './components/ProductImageUpload'
import { ProductUpsertForm } from './components/ProductUpsertForm'
import { ProductVariantsSection } from './components/ProductVariantsSection'

export function ProductEditPage() {
  const dispatch = useAppDispatch()
  const { productId: productIdParam } = useParams<{ productId: string }>()
  const productId = productIdParam ?? ''

  const selected = useAppSelector((s) => s.products.selectedProduct)
  const update = useAppSelector((s) => s.products.updateProduct)
  const deleteVariant = useAppSelector((s) => s.products.deleteVariant)
  const categoriesList = useAppSelector((s) => s.categories.categoriesList)

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      brand: '',
      enabled: true,
    },
  })

  const watchedName = useWatch({ control, name: 'name' })

  const [deleteDialogVariantId, setDeleteDialogVariantId] = useState<string | null>(null)

  const invalidId = productId.length === 0

  useEffect(() => {
    if (invalidId) return
    dispatch(fetchListRequest())
    dispatch(fetchProductDetailRequest(productId))
    return () => {
      dispatch(clearSelectedProduct())
      dispatch(clearUpdateProduct())
      dispatch(clearDeleteVariant())
    }
  }, [dispatch, productId, invalidId])

  useEffect(() => {
    const d = selected.data
    if (!d) return
    reset(productDetailToFormValues(d))
  }, [selected.data, reset])

  useEffect(() => {
    if (update.data && !update.pending) {
      dispatch(clearUpdateProduct())
    }
  }, [update.data, update.pending, dispatch])

  useEffect(() => {
    if (deleteVariant.data && !deleteVariant.pending) {
      setDeleteDialogVariantId(null)
      dispatch(clearDeleteVariant())
    }
  }, [deleteVariant.data, deleteVariant.pending, dispatch])

  const onValid = (values: ProductFormValues) => {
    if (invalidId) return
    dispatch(
      updateProductRequest({
        productId,
        body: productFormValuesToPayload(values),
      }),
    )
  }

  const confirmDelete = () => {
    if (!deleteDialogVariantId || invalidId) return
    dispatch(
      deleteVariantRequest({
        productId,
        variantId: deleteDialogVariantId,
      }),
    )
  }

  const closeDeleteDialog = () => {
    if (!deleteVariant.pending) {
      setDeleteDialogVariantId(null)
      dispatch(clearDeleteVariant())
    }
  }

  if (invalidId) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Edit product
        </Typography>
        <Typography color="error">Invalid product.</Typography>
        <Button component={RouterLink} to="/products" variant="outlined" sx={{ mt: 2 }}>
          Back to list
        </Button>
      </Box>
    )
  }

  const showFormShell = Boolean(selected.data) || selected.pending
  const showInitialLoad = selected.pending && !selected.data
  const detail = selected.data

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Edit product
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Products
        </Link>
        <Typography color="text.primary">{productId}</Typography>
      </Breadcrumbs>

      <ErrorAlert error={selected.error} sx={{ mb: 2 }} />
      {selected.error && !selected.pending ? (
        <Button
          variant="outlined"
          onClick={() => dispatch(fetchProductDetailRequest(productId))}
          sx={{ mb: 2 }}
        >
          Retry
        </Button>
      ) : null}

      {showFormShell ? (
        <>
          <ProductUpsertForm
            heroTitle="Product details"
            heroDescription="Update name, description, category, brand, and whether the product is enabled for sale."
            loading={showInitialLoad}
            categories={categoriesList.data}
            categoriesLoading={categoriesList.pending && categoriesList.data.length === 0}
            control={control}
            onSubmit={handleSubmit(onValid)}
            pending={update.pending}
            error={update.error}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            cancelTo="/products"
            additionalFields={
              detail ? (
                <ProductImageUpload
                  deferUpload={false}
                  productId={detail.id}
                  entityName={watchedName?.trim() ? watchedName.trim() : detail.name}
                  currentImageUrl={detail.imageUrl}
                  onImmediateUploadComplete={() => {
                    dispatch(fetchProductDetailRequest(productId))
                  }}
                />
              ) : undefined
            }
          />

          {detail ? (
            <ProductVariantsSection
              productId={detail.id}
              variants={detail.variants}
              deleteError={deleteVariant.error}
              deletePending={deleteVariant.pending}
              onDeleteRequest={(variantId) => {
                dispatch(clearDeleteVariant())
                setDeleteDialogVariantId(variantId)
              }}
            />
          ) : null}
        </>
      ) : null}

      <Dialog open={Boolean(deleteDialogVariantId)} onClose={closeDeleteDialog}>
        <DialogTitle>Delete variant?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This variant will be removed from the product. This action cannot be undone.
          </DialogContentText>
          <ErrorAlert error={deleteVariant.error} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteVariant.pending}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteVariant.pending}
          >
            {deleteVariant.pending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
