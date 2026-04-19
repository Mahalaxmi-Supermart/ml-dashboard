import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchListRequest } from '../../redux/reducers/categoriesSlice'
import {
  clearCreateProduct,
  createProductRequest,
  fetchPageRequest,
} from '../../redux/reducers/productsSlice'
import { uploadProductImage } from '../../redux/services/mediasService'
import { ProductImageUpload } from './components/ProductImageUpload'
import {
  emptyProductFormValues,
  productFormValuesToPayload,
  type ProductFormValues,
} from './productsTypes'
import { ProductUpsertForm } from './components/ProductUpsertForm'

export function ProductNewPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const create = useAppSelector((s) => s.products.createProduct)
  const categoriesList = useAppSelector((s) => s.categories.categoriesList)
  const lastQuery = useAppSelector((s) => s.products.lastQuery)

  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [postCreateBusy, setPostCreateBusy] = useState(false)
  const [postCreateImageError, setPostCreateImageError] = useState<string | null>(null)
  /** Prevents duplicate auto-upload attempts for the same create (incl. after failure). */
  const imageUploadStartedRef = useRef(false)

  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues: emptyProductFormValues,
  })

  useEffect(() => {
    dispatch(fetchListRequest())
    dispatch(clearCreateProduct())
    imageUploadStartedRef.current = false
  }, [dispatch])

  useEffect(() => {
    if (!create.data || create.pending) return

    if (pendingImageFile) {
      if (imageUploadStartedRef.current) return
      imageUploadStartedRef.current = true
      setPostCreateImageError(null)

      const detail = create.data
      const file = pendingImageFile
      setPostCreateBusy(true)

      uploadProductImage({
        productId: detail.id,
        file,
        productName: detail.name,
      })
        .then(() => {
          navigate(`/products/${detail.id}/edit`, { replace: true })
          dispatch(clearCreateProduct())
          dispatch(fetchPageRequest(lastQuery))
          setPendingImageFile(null)
        })
        .catch((e: unknown) => {
          setPostCreateImageError(
            e instanceof Error ? e.message : 'Could not upload image. Product was created.',
          )
        })
        .finally(() => {
          setPostCreateBusy(false)
        })
      return
    }

    navigate(`/products/${create.data.id}/edit`, { replace: true })
    dispatch(clearCreateProduct())
    dispatch(fetchPageRequest(lastQuery))
  }, [create.data, create.pending, pendingImageFile, navigate, dispatch, lastQuery])

  const onValid = (values: ProductFormValues) => {
    setPostCreateImageError(null)
    dispatch(createProductRequest(productFormValuesToPayload(values)))
  }

  const retryPostCreateUpload = () => {
    const detail = create.data
    const file = pendingImageFile
    if (!detail || !file) return
    setPostCreateImageError(null)
    setPostCreateBusy(true)
    uploadProductImage({
      productId: detail.id,
      file,
      productName: detail.name,
    })
      .then(() => {
        navigate(`/products/${detail.id}/edit`, { replace: true })
        dispatch(clearCreateProduct())
        dispatch(fetchPageRequest(lastQuery))
        setPendingImageFile(null)
      })
      .catch((e: unknown) => {
        setPostCreateImageError(
          e instanceof Error ? e.message : 'Could not upload image. Product was created.',
        )
      })
      .finally(() => setPostCreateBusy(false))
  }

  const formPending = create.pending || postCreateBusy

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Add product
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Products
        </Link>
        <Typography color="text.primary">New</Typography>
      </Breadcrumbs>

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

      <ProductUpsertForm
        heroTitle="New product"
        heroDescription="Create a product with name, description, category, and brand. You can add variants after saving."
        categories={categoriesList.data}
        categoriesLoading={categoriesList.pending && categoriesList.data.length === 0}
        control={control}
        onSubmit={handleSubmit(onValid)}
        pending={formPending}
        error={create.error}
        submitLabel="Create product"
        pendingLabel="Creating…"
        cancelTo="/products"
        additionalFields={
          <ProductImageUpload
            deferUpload
            entityName=""
            onDeferredFileChange={(f) => {
              setPostCreateImageError(null)
              imageUploadStartedRef.current = false
              setPendingImageFile(f)
            }}
          />
        }
      />
    </Box>
  )
}
